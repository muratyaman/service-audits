// Main application file

const compression = require('compression');
const express     = require('express');
const bodyParser  = require('body-parser');
const mongoose    = require('mongoose');
const Schema      = mongoose.Schema;
const Types       = mongoose.Types;
const app         = express();

// TODO: load config from .env
const config = {
  port: 3000,
  db: {
    url: 'mongodb://localhost:27017/service-audit',
    collection_name: 'audits'
  }
};

// Attempt to connect to the database server
mongoose.connect(config.db.url, { useMongoClient: true, promiseLibrary: global.Promise });

/**
 * Define/initialize Audit Schema
 */
const auditSchema = new Schema({
  _id:         { type: Schema.Types.ObjectId, unique: true,  required: true },
  app_id:      { type: String, index: true, required: true },
  entity_type: { type: String, index: true, required: true },
  entity_id:   { type: String, index: true, required: true },
  user_id:     { type: String, index: true, required: true },
  change:      Schema.Types.Mixed,
  created:     { type: Date, index: true, required: true },
  received:    { type: Date, default: Date.now }
});

// Mongoose automatically looks for the plural version of your model name
const AuditModel = mongoose.model('AuditModel', auditSchema, config.db.collection_name);

/**
 * Define audit service
 */
class AuditService {

  /**
   * Constructor
   */
  constructor () {
    console.log('new AuditService instance');// TODO: remove on production
  }

  /**
   * Index handler
   * @param request
   * @param response
   */
  index (request, response) {
    console.log('index');// TODO: remove on production
    response.send('service-audits');
  }

  /**
   * Search audit entries
   * @param request
   * @param response
   */
  search (request, response) {
    console.log('search');// TODO: remove on production
    let { app_id, entity_type, entity_id, user_id, limit, offset, start_date, end_date } = request.params;

    let criteria = { app_id };
    if (entity_type) { // string
      criteria[ 'entity_type' ] = entity_type;
    }
    if (entity_id) { // string
      criteria[ 'entity_id' ] = entity_id;
    }
    if (user_id) { // string
      criteria[ 'user_id' ] = user_id;
    }
    if (start_date) { // TODO: convert to date
      criteria[ 'created' ] = { $gt: start_date };
    }
    if (end_date) { // TODO: convert to date
      criteria[ 'created' ] = { $lt: end_date };
    }

    limit = parseInt(limit);
    if (limit < 0) limit = 10;
    if (100 < limit) limit = 100;

    offset = parseInt(offset);
    if (offset < 0) offset = 0;
    if (100 < offset) offset = 0;

    const sort = { created: -1 };

    const service = this;
    AuditModel.find(criteria)
      .limit(limit)
      .skip(offset)
      .sort(sort)
      .exec((err, audits) => service.onSearch(err, audits, request, response));
  }

  /**
   * Callback for search results
   * @param err
   * @param audits
   * @param request
   * @param response
   */
  onSearch (err, audits, request, response) {
    console.log('onSearch');// TODO: remove on production
    response.json({
      error: err,
      data: audits
    });
  }

  /**
   * Create a audit entry
   * @param request
   * @param response
   */
  create (request, response) {
    console.log('create');// TODO: remove on production
    const app_id   = request.params.app_id;

    // destructuring with default value
    const { data } = request.body;

    // destructuring with default values
    let { entity_type, entity_id, user_id, change, created } = data;
    const audit_id  = new Types.ObjectId();
    const auditData = { _id: audit_id, app_id, entity_type, entity_id, user_id, change, created };
    const service   = this;
    try {
      AuditModel.create(auditData, (err, audit) => service.onCreate(err, audit, request, response));
    } catch (err) {
      service.onCreate(err, null, request, response);
    }
  }

  /**
   * Callback for create action
   * @param err
   * @param audit
   * @param request
   * @param response
   */
  onCreate (err, audit, request, response) {
    console.log('onCreate');// TODO: remove on production
    response.json({
      error: err,
      data: audit
    });
  }

  /**
   * Retrieve a audit entry
   * @param request
   * @param response
   */
  retrieve (request, response) {
    console.log('retrieve');// TODO: remove on production
    const app_id   = request.params.app_id;
    const audit_id = request.params.audit_id;
    const service  = this;
    AuditModel.find({ _id: audit_id, app_id }, (err, audit) => service.onRetrieve(err, audit, request, response));
  }

  /**
   * Callback for retrieve action
   * @param err
   * @param audit
   * @param request
   * @param response
   */
  onRetrieve (err, audit, request, response) {
    console.log('onRetrieve');// TODO: remove on production
    response.json({
      error: err,
      data: audit
    });
  }

  /**
   * Update a audit entry
   * @param request
   * @param response
   */
  update (request, response) {
    console.log('update');// TODO: remove on production
    const app_id   = request.params.app_id;
    const audit_id = request.params.audit_id;
    const { data } = request.body;
    const setter   = { $set: data };
    const service  = this;
    try {
      // TODO: use app_id
      AuditModel.findByIdAndUpdate(
        audit_id, setter, { new: false }, (err, auditUpdated) => service.onUpdate(err, auditUpdated, request, response)
      );
    } catch (err) {
      service.onUpdate(err, null, request, response);
    }
  }

  /**
   * Callback for update action
   * @param err
   * @param auditUpdated
   * @param request
   * @param response
   */
  onUpdate (err, auditUpdated, request, response) {
    console.log('onUpdate');// TODO: remove on production
    response.json({
      error: err,
      data: auditUpdated
    });
  }

  /**
   * Delete a audit entry
   * @param request
   * @param response
   */
  remove (request, response) {
    console.log('remove');// TODO: remove on production
    const app_id   = request.params.app_id;
    const audit_id = request.params.audit_id;
    const options  = {};
    const service  = this;
    try {
      // TODO: use app_id
      AuditModel.findByIdAndRemove(
        audit_id, options, (err, auditDeleted) => service.onRemove(err, auditDeleted, request, response)
      );
    } catch (err) {
      service.onRemove(err, null, request, response);
    }
  }

  /**
   * Callback for remove/delete action
   * @param err
   * @param auditDeleted
   * @param request
   * @param response
   */
  onRemove (err, auditDeleted, request, response) {
    console.log('onRemove');// TODO: remove on production
    response.json({
      error: err,
      data: auditDeleted
    });
  }
}


// If/when we are behind a proxy, we will trust on the localhost for now
// @see https://expressjs.com/en/guide/behind-proxies.html
app.set('trust proxy', 'loopback');

// Use compression
app.use(compression());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// Note: bodyParser has to be defined before the routes; otherwise we receive empty request.body

// Define routes
app.get   ('/',                         (request, response) => { const audits = new AuditService(); audits.index(request, response); });
app.post  ('/test',                     (request, response) => { response.json(request.body); });
app.get   ('/audits/:app_id',           (request, response) => { const audits = new AuditService(); audits.search(request, response) });
app.post  ('/audits/:app_id',           (request, response) => { const audits = new AuditService(); audits.create(request, response); });
app.get   ('/audits/:app_id/:audit_id', (request, response) => { const audits = new AuditService(); audits.retrieve(request, response); });
app.put   ('/audits/:app_id/:audit_id', (request, response) => { const audits = new AuditService(); audits.update(request, response); });
app.delete('/audits/:app_id/:audit_id', (request, response) => { const audits = new AuditService(); audits.remove(request, response); });


// TODO: use a process manager: http://pm2.keymetrics.io/

// TODO: use a cluster: https://nodejs.org/dist/latest/docs/api/cluster.html

// Start listening on port
app.listen(config.port, function () {
  console.log('service-audits is listening on port ' + config.port);
});

// TODO: also use websockets
