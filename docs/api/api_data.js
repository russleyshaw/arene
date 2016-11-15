define({ "api": [
  {
    "group": "Builder",
    "name": "Build_Client_Code",
    "description": "<p>Builds code for client given by id</p>",
    "type": "post",
    "url": "/api/v2/build/:id",
    "title": "",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "number",
            "optional": false,
            "field": "id",
            "description": "<p>Database client id</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "optional": false,
            "field": "200",
            "description": "<p>The client is valid and build has started</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "400",
            "description": "<p>Invalid parameters were given</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "404",
            "description": "<p>The client is valid and the build has started</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/build_server/api.js",
    "groupTitle": "Builder"
  },
  {
    "group": "Builder",
    "type": "get",
    "url": "/api/v2/build/:id/tar",
    "title": "",
    "name": "Get_Build",
    "description": "<p>Gets the tarred build of the most recent build for a client's code</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "number",
            "optional": false,
            "field": "id",
            "description": "<p>Integer representing the id of the client in the database</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "optional": false,
            "field": "200",
            "description": "<p>The tarred build itself</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "404",
            "description": "<p>The tarred build for the given client id was not found</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/build_server/api.js",
    "groupTitle": "Builder"
  },
  {
    "group": "Builder",
    "type": "get",
    "url": "/api/v2/build/:id/log",
    "title": "",
    "name": "Get_Build_Log",
    "description": "<p>Gets the build log of the client's most recent build</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "number",
            "optional": false,
            "field": "id",
            "description": "<p>Database client id</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "optional": false,
            "field": "200",
            "description": "<p>The build log for the most recent build of the specified client id</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "404",
            "description": "<p>The build log for the build was not found</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/build_server/api.js",
    "groupTitle": "Builder"
  },
  {
    "group": "Builder",
    "type": "get",
    "url": "/api/v2/build/:id/log",
    "title": "",
    "name": "Get_Build_Log",
    "description": "<p>Gets the build log of the client's most recent build</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "number",
            "optional": false,
            "field": "id",
            "description": "<p>Database client id</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "optional": false,
            "field": "200",
            "description": "<p>The build log for the most recent build of the specified client id</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "404",
            "description": "<p>The build log for the build was not found</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/build_server/api.js",
    "groupTitle": "Builder"
  },
  {
    "group": "Builder",
    "type": "get",
    "url": "/api/v2/build/:id",
    "title": "",
    "name": "Get_build_information_location",
    "description": "<p>Gets the URLs for the requested information locations</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "number",
            "optional": false,
            "field": "id",
            "description": "<p>Integer representing the id of the client in the database</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/build_server/api.js",
    "groupTitle": "Builder"
  },
  {
    "group": "Gamelog",
    "name": "Get_gamelog",
    "description": "<p>Gets a gamelog from the server</p>",
    "type": "get",
    "url": "/api/v2/glog/:glog",
    "title": "",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "integer",
            "optional": false,
            "field": "glog",
            "description": "<p>Gamelog id</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "optional": false,
            "field": "200",
            "description": ""
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "400",
            "description": "<p>Invalid arguments</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "404",
            "description": "<p>Gamelog not found</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/gamelog_server/main.js",
    "groupTitle": "Gamelog"
  },
  {
    "group": "Gamelog",
    "type": "post",
    "url": "/api/v2/glog/",
    "title": "",
    "name": "Post_gamelog",
    "description": "<p>Store a gamelog stored in the request body</p>",
    "version": "0.0.0",
    "filename": "src/gamelog_server/main.js",
    "groupTitle": "Gamelog"
  }
] });
