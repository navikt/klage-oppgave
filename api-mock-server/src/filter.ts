import { Transform } from "stream";

function JsonParser() {
  Transform.call(this, { objectMode: true });
  this._transform = function _transform(json: any, enc: string, done: any) {
    try {
      this.push(JSON.parse(json));
    } catch (e) {
      return done(e);
    }
    done();
  };
}

JsonParser.prototype = Object.create(Transform.prototype, {
  constructor: {
    value: JsonParser,
  },
});

export default JsonParser;
