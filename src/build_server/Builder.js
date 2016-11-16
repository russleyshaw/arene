var config = require("config");
var child_process = require("child_process");
var fs = require("fs");
var path = require("path");
var async = require("async");
var Client = require("../common/Client");
var Db = require("../common/Db");
var knex = require("knex")({
    dialect: "pg"
});

/**
 * Manager of building and accessing client docker images
 */
class Builder {

    constructor() {
        this._build_interval = undefined;
        this._build_interval_time = 1000;
        this._num_building = 0;
        this.MAX_BUILDING = 1;

        this.log_dir = path.join(__dirname, "../../", config.build_server.log_dir);
        this.tar_dir = path.join(__dirname, "../../", config.build_server.tar_dir);
        this.hash_dir = path.join(__dirname, "../../", config.build_server.hash_dir);
    }

    /**
     * Callback invoked when the builder is finished initializing
     * @callback Builder~initCallback
     * @param err
     */

    /**
     * Initializes the builder
     * @desc Initializes the builder by building docker images for each supported language
     * @param callback {Builder~initCallback}
     */
    init(callback) {
        console.log("Initializing...");
        //TODO: Add other docker base images
        var cmds = [
            `docker build -t base_cpp -f ${ path.join(__dirname, "dockerfiles/base_cpp.dockerfile")} . > ${path.join(this.log_dir, "base_cpp.log")}`,
            `docker build -t base_js -f ${path.join(__dirname, "dockerfiles/base_js.dockerfile")} . > ${path.join(this.log_dir, "base_js.log")}`,
        ];

        //Build each base image
        async.map(cmds, function(cmd, cb) {
            child_process.exec(cmd, function(err) {
                if(err) return cb(err);
                cb();
            });
        }, function(err){
            if(err) return callback(err);
            console.log("Initialized");
            callback();
        });
    }


    /**
     * Starts the building service
     */
    start() {
        console.log("Starting build service...");
        clearInterval(this._build_interval);
        this._build_interval = setInterval(() => {
            //Don't build more if at maSx
            if(this._num_building >= this._MAX_BUILDING) return;

            //Select oldest client needing build, with
            var sql = knex("client")
                .where("needs_build", true)
                .whereNotNull("repo").whereNotNull("hash").whereNotNull("language")
                .orderBy("attempt_time")
                .limit(1)
            .toString();
            Db.queryOnce(sql, [], (err, result) => {
                if(err) return console.warn(`Error: ${JSON.stringify(err)}`);
                if(result.rows.length < 1) return; //None needing building

                this._num_building++;

                var client = result.rows[0];

                this.build(client.id, (err) => {
                    if(err) return console.warn(`Error: ${JSON.stringify(err)}`);
                    this._num_building--;
                });
            });
        }, this._build_interval_time);
    }

    /**
     * Stop checking for clients flagged as needing builds
     */
    stop() {
        console.log("Stopping build service...");
        clearInterval(this._build_interval);
        console.log("Stopped build service");
    }

    _unsetNeedsBuild(client, callback) {
        var sql = knex("client").where({id: client.id}).update({needs_build: false}, "*").toString();
        Db.queryOnce(sql, [], (err) => {
            if(err) return callback(err);
            callback();
        });
    }

    /**
     * Callback invoked when the client code has finished building
     * @callback Builder~buildCallback
     * @param err
     * @param built {boolean} True if the client code was built successfully
     */

    /**
     * Builds client based on client id and database git repo, hash and language
     * @param client_id {number} Integer id of individual client in database
     * @param callback {Builder~buildCallback}
     */
    build(client_id, callback) {
        console.log(`Building client ${client_id}...`);

        Client.getById(client_id, (err, client)=>{
            if(err) return callback(err);

            this._unsetNeedsBuild(client, (err)=>{
                if(err) return callback(err);

                this._buildImageAndTmpLog(client,(err, built)=>{
                    if(err) return callback(err);

                    if(built) {
                        this._buildImageGood(client, (err)=>{
                            if(err) return callback(err);

                            //Write to db
                            var sql = knex("client").where({id: client.id}).update({
                                success_time: "now()",
                                modified_time: "now()",
                                attempt_time: "now()",
                                build_success: true
                            }, "*").toString();
                            Db.queryOnce(sql, [], (err) => {
                                if(err) return callback(err);
                                console.log(`Built client ${client_id} with success`);
                                callback(null, true);
                            });
                        });
                        return;
                    }
                    else {
                        this._applyTmpFilesBad(client, (err)=>{
                            if(err) return callback(err);

                            //Write to db
                            var sql = knex("client").where({id: client.id}).update({
                                failure_time: "now()",
                                modified_time: "now()",
                                attempt_time: "now()",
                                build_success: false

                            }, "*").toString();
                            Db.queryOnce(sql, [], (err) => {
                                if(err) return callback(err);
                                console.log(`Built client ${client.id} with failure`);
                                callback(null, false);
                            });
                        });
                        return;
                    }
                });
            });
        });
    }

    /**
     * Image built successfully. Save tar and hash temporarily, then apply tmp files. Update db
     * @param client {Object}
     * @param callback
     * @private
     */
    _buildImageGood(client, callback) {
        this._saveTarTmp(client, (err) => {
            if(err) return callback(err);

            this._saveHashTmp(client, (err) => {
                if(err) return callback(err);

                this._applyTmpFilesGood(client, (err) => {
                    if(err) return callback(err);
                    callback();
                });
            });
        });
    }

    /**
     * @callback Builder~_buildImageAndTmpCallback
     * @param err
     * @param build_success {boolean} Whether the build suceeded or not
     */

    /**
     * Builds docker image from a given Client
     * @param client {Object}
     * @param callback {Builder~_buildImageAndTmpCallback}
     * @private
     */
    _buildImageAndTmpLog(client, callback) {
        console.log(`Building image and tmp log for client ${client.id}...`);

        var cmds = {
            "cpp": `docker build -t client_${client.id} --build-arg REPO=${client.repo} --build-arg HASH=${client.hash} -f ${path.join(__dirname, "dockerfiles/client_cpp.dockerfile")} . > ${path.join(this.log_dir, `client_${client.id}.log.tmp`)}`,
            "js": `docker build -t client_${client.id} --build-arg REPO=${client.repo} --build-arg HASH=${client.hash} -f ${path.join(__dirname, "dockerfiles/client_js.dockerfile")} . > ${path.join(this.log_dir, `client_${client.id}.log.tmp`)}`,
        };

        if(!(client.language in cmds)) return callback(new Error("Language not supported!"));

        var cmd = cmds[client.language];
        child_process.exec(cmd, (err)=>{
            console.warn(err);
            //Failure to build is a build failure, not an error
            if(err) return callback(null, false);
            callback(null, true);
        });
    }

    /**
     * @callback Builder~_saveTarTmp
     * @param err
     */

    /**
     * Save image to temporary tar
     * @param client {Object}
     * @param callback {Builder~_saveTarTmp}
     * @private
     */
    _saveTarTmp(client, callback) {
        console.log(`Saving temporary tar for client ${client.id}...`);
        var cmd = `docker save -o ${path.join(this.tar_dir, `client_${client.id}.tar.tmp`)} client_${client.id}`;
        child_process.exec(cmd, (err) => {
            if(err) return callback(err);
            callback();
        });
    }

    /**
     * @callback Builder~_saveHashTmp
     * @param err
     */

    /**
     * Save tar hash to temporary file
     * @param client {Object}
     * @param callback {Builder~_saveHashTmp}
     * @private
     */
    _saveHashTmp(client, callback) {
        console.log(`Saving temporary hash for client ${client.id}...`);
        var cmd = `sha256sum ${path.join(this.tar_dir, `client_${client.id}.tar.tmp`)} > ${path.join(this.hash_dir, `client_${client.id}.sha256.tmp`)}`;
        child_process.exec(cmd, (err) =>{
            if(err) return callback(err);
            callback();
        });
    }

    /**
     * @callback Builder~_applyTmpFilesGood
     * @param err
     */

    /**
     * Applies generated temporary files to normal file pool
     * @param client {Object}
     * @param callback {Builder~_applyTmpFilesGood}
     * @private
     */
    _applyTmpFilesGood(client, callback) {
        console.log(`Applying temporary files for good client ${client.id}...`);
        var cmds = [
            `mv -f ${path.join(this.tar_dir, `client_${client.id}.tar.tmp`)} ${path.join(this.tar_dir, `client_${client.id}.tar`)}`,
            `mv -f ${path.join(this.log_dir, `client_${client.id}.log.tmp`)} ${path.join(this.log_dir, `client_${client.id}.log`)}`,
            `mv -f ${path.join(this.hash_dir, `client_${client.id}.sha256.tmp`)} ${path.join(this.hash_dir, `client_${client.id}.sha256`)}`
        ];

        async.map(cmds, (cmd, cb) => {
            child_process.exec(cmd, (err) => {
                if(err) return cb(err);
                cb();
            });
        }, (err) => {
            if(err) return callback(err);
            callback();
        });
    }

    /**
     * @callback Builder~_applyTmpFilesBad
     * @param err
     */

    /**
     * Image failed building. Delete .tar and .log, update db
     * @param client {Object}
     * @param callback {Builder~_applyTmpFilesBad}
     * @private
     */
    _applyTmpFilesBad(client, callback) {
        console.log(`Applying temporary files for bad client ${client.id}...`);
        var cmds = [
            `rm -f ${path.join(this.tar_dir, `client_${client.id}.tar`)} ${path.join(this.hash_dir, `client_${client.id}.sha256`)}`,
            `mv -f ${path.join(this.log_dir, `client_${client.id}.log.tmp`)} ${path.join(this.log_dir, `client_${client.id}.log`)}`,
        ];

        async.map(cmds, (cmd, cb)=>{
            child_process.exec(cmd, (err)=>{
                if(err) return cb(err);
                cb();
            });
        }, (err) => {
            if(err) return callback(err);
            callback();
        });
    }

    /**
     * Callback invoked when finished retrieving the tar file
     * @callback Builder~getTarCallback
     * @param err
     * @param tar_data
     */

    /**
     * Gets a tar image from the file system
     * @param client_id {integer} Integer id of individual client in database
     * @param callback {Builder~getTarCallback}
     */
    getTar(client_id, callback) {
        fs.readFile( path.join(this.tar_dir, `client_${client_id}.tar`), (err, data)=>{
            if(err) return callback(err);
            callback(null, data);
        });
    }

    /**
     * Callback invoked when finished retrieving build log
     * @callback Builder~getLogCallback
     * @param err
     * @param log_data
     */

    /**
     * Gets the build log from the file system
     * @param client_id {integer} Integer id of individual client in database
     * @param callback {Builder~getLogCallback}
     */
    getLog(client_id, callback) {
        fs.readFile( path.join(this.log_dir, `client_${client_id}.log`), (err, data)=>{
            if(err) return callback(err);
            callback(null, data);
        });
    }

    getHash(client_id, callback) {
        fs.readFile( path.join(this.hash_dir, `client_${client_id}.sha256`), (err, data)=>{
            if(err) return callback(err);
            callback(null, data);
        });
    }
}

module.exports = Builder;
