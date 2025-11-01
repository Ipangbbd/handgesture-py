class CV {
  _dispatch(event) {
    const { msg } = event;
    this._status[msg] = ['loading'];
    this.worker.postMessage(event);
    return new Promise((res, rej) => {
      let interval = setInterval(() => {
        const status = this._status[msg];
        if (status[0] === 'done') res(status[1]);
        if (status[0] === 'error') rej(status[1]);
        if (status[0] !== 'loading') {
          delete this._status[msg];
          clearInterval(interval);
        }
      }, 50);
    });
  }

  load() {
    this._status = {};
    this.worker = new Worker('/js/cv.worker.js'); // load worker

    // Capture events and save [status, event] inside the _status object
    this.worker.onmessage = (e) => {
      console.log(['done', e], e.data.msg, e.data);
      this._status[e.data.msg] = ['done', e];
    };
    this.worker.onerror = (e) => {
      console.log(e, 'this is error');
      this._status[e.message] = ['error', e];
    };
    return this._dispatch({ msg: 'load' });
  }
  /**
   * We are going to use the _dispatch event we created before to
   * call the postMessage with the msg and the image as payload.
   *
   * Thanks to what we've implemented in the _dispatch, this will
   * return a promise with the processed image.
   */
  imageProcessing(payload) {
    console.log('trying to run image prossessing');
    return this._dispatch({ msg: 'imageProcessing', payload });
  }
}

// Export the same instant everywhere
export default new CV();
