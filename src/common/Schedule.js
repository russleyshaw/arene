var Db = require("./Db");
var knex = require("knex")({
    dialect: "pg"
});
/**
 * Class to interface with scheduler table in database
 */

class Schedule{
    /**
     * @callback Schedule~createCallback
     * @param err
     * @param schedule {Object} updated schedule
     */

    /**
     * Creates a schedule when given a scheduler type
     * @param schedule {Object}
     * @callback {Schedule~createCallback}
     */
    static create(schedule, callback){
        if(schedule.hasOwnProperty("id")) return callback("schedule ids are created automatically");
        if(schedule.hasOwnProperty("created_time")) return callback("Cannot create with created time");
        if(schedule.hasOwnProperty("modified_time")) return callback("Cannot create with modified time");

        schedule.created_time = "now()";
        schedule.modified_time = "now()";


        var sql = knex("schedule").insert(schedule,"*").toString();
        Db.queryOnce(sql,[],function(err,result){
            if(err)return console.error("queryOnce in schedule.create() returns an error");
            callback(null,result.rows[0]);
        });
    }

    /**
     * @callback Schedule ~getCallback
     * @param err
     * @param schedule {Object}
     *
     */

     /**
     *
     * Retreives a schedule with given config
     * @param describe {Object}
     * @callback {Schedule ~getCallback}
     */
    static get(describe,callback){
        var sql =knex("schedule").select();

        if(describe.hasOwnProperty("id")) {
            if (Array.isArray(describe)) sql = sql.whereIn("id", describe.id);
            else sql = sql.where("id", describe.id);
        }
        if(describe.hasOwnProperty("status")) {
            if (Array.isArray(describe))sql = sql.whereIn("status", describe.status);
            else sql  = sql.where("status", describe.status);
        }
        if(describe.hasOwnProperty("type")){
            if(Array.isArray(describe))sql=sql.whereIn("type",describe.type);
            else sql= sql.where("type",describe.type);
        }
        sql=sql.toString();
        Db.queryOnce(sql,[],(err,result)=>{
          if(err)callback(err);
          callback(null,result.rows);
        });



    }

    /**
     * @callback
     * @param err
     * @param Schedule {Object}
     *
     *
     * Retreives a schedule by its ID#
     * @param a schedule id
     * @callback {Schedule ~getByIDcallback}
     */
    static getByID(schedule_id, callback){
        var sql = knex("schedule").where("id",schedule_id).toString();
        Db.queryOnce(sql,[],function(err,result){
            if(err)return console.error("queryOnce in schedule.getByID() returns an error");
            callback(null,result.rows[0]);
        });
    }
}

module.exports = Schedule;
