export default function HttpRequestInstance () {

  if (typeof window.HttpRequestInstance_ !== 'undefined')
    return Promise.resolve(window.HttpRequestInstance_);

  window.HttpRequestInstance_ = new HttpRequest();

  return Promise.resolve(window.HttpRequestInstance_);
}

class HttpRequest{
  constructor(){

    this.config = {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded'
     };
  }
  parse(req){
    let result;
    try {

        result = JSON.parse(req.responseText);
    } catch (e) {
        result = req.responseText;
    }
    return result;
  };

  getParams(data){

    let params = (typeof data === 'string')? data : Object.keys(data).map((k)=>{
          return encodeURIComponent(k) + '=' + encodeURIComponent(data[k])
        }
      ).join('&');

      return params;
  };

  setRequestHeader(req, config){
    for(var h in config) {
        req && req.setRequestHeader(h, config[h]);
    }
  };

  xhr(RestMethod ,url,data){
         let req = null
        , callbacks = {
              success: function () {},
              error: function () {},
              always: function () {}
        };


        let method = RestMethod.toUpperCase();

        req = new(XMLHttpRequest || ActiveXObject)('MSXML2.XMLHTTP.3.0');
        if(method === 'GET' || method ==="PUT" || method === "DELETE") {
            req.open(method, url + "?" + this.getParams(data), true);
        } else {

            req.open(method, url, true);
            this.setRequestHeader(req, this.config)
        }

        req.onreadystatechange = ()=>{
            let results;
              if (req.readyState === 4) {

                  results = this.parse(req);
                if (req.status >= 200 && req.status < 300) {
                      callbacks.success.call({}, results);
                } else {
                      callbacks.error.call({}, req.status);
                }
                callbacks.always.apply({}, [results, req]);
            }
          };

        method === 'get' ? req.send() : req.send(this.getParams(data));

        var feedbacks = {
            success: function (callback) {
              callbacks.success = callback;
              return this;
            },
            error: function (callback) {
              callbacks.error = callback;
              return this;
            },
            always: function (callback) {
              callbacks.always = callback;
              return this;
            }
          };
          return feedbacks;
    }
    request(ops){
      if(typeof ops !== "object") return;
      return this.xhr(ops.method, ops.url, ops.data);
    }
    get(url, data){
      return this.xhr("GET", url, data);
    }
    post(url, data){
      return this.xhr("POST", url, data);
    }
    delete(url, data){
      return this.xhr("DELETE", url, data);
    }
    put(url, data){
      return this.xhr("PUT", url, data);
    }
}
