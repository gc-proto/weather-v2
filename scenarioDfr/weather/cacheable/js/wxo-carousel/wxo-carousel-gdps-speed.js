var setSpeed = function(){
    //Interval/play related variables

    var speedMod = {
        initInterval : 225,
        maxInterval : 1500,
        minInterval : 49,
        increaseDelta : 36,
        decreaseDelta : 255,
        lastFrameDelay : function(){
          if(state.interval === state.speed.minInterval){
            return 500;
          }else if(state.interval > state.speed.minInterval && state.interval < state.speed.initInterval){
            return 1000;
          }else if(state.interval === state.speed.initInterval){
            return 1500;
          }else if(state.interval > state.speed.initInterval && state.interval < state.speed.maxInterval){
            return 2250;
          }else if(state.interval === state.speed.maxInterval){
            return 3000;
          }
        }
    };
    return speedMod;

};