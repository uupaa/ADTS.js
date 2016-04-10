var ModuleTestADTS = (function(global) {

var test = new Test(["AAC"], { // Add the ModuleName to be tested here (if necessary).
        disable:    false, // disable all tests.
        browser:    true,  // enable browser test.
        worker:     false,  // enable worker test.
        node:       false,  // enable node test.
        nw:         true,  // enable nw.js test.
        el:         true,  // enable electron (render process) test.
        button:     true,  // show button.
        both:       true,  // test the primary and secondary modules.
        ignoreError:false, // ignore error.
        callback:   function() {
        },
        errorback:  function(error) {
            console.error(error.message);
        }
    });

if (IN_BROWSER || IN_NW || IN_EL) {
    test.add([
        testAAC_AAC_LC_parse,
    ]);
}

// --- test cases ------------------------------------------
function testAAC_AAC_LC_parse(test, pass, miss) {
    var sourceFile = "../assets/AAC-LC.aac";

    WebAudio.init(function(audioContext) { // @arg PlayableAudioContext
        FileLoader.toArrayBuffer(sourceFile, function(arrayBuffer) {

            // get AAC duration
            var byteStream    = new Uint8Array(arrayBuffer);
            var audioMetaData = ADTS.parse(byteStream);
            var audioBlob     = ADTS.toBlob(byteStream, 0, 32);

            console.log("AAC duration", audioMetaData.duration);

            //var audioBlob = new Blob([arrayBuffer], { type: "audio/aac" });
            FileLoader.toArrayBuffer(audioBlob, function(arrayBuffer) {

                audioContext.decodeAudioData(arrayBuffer, function(audioBuffer) { // @arg AudioBuffer - PCM data
                    console.dir({
                        duration:   audioBuffer.duration,
                        length:     audioBuffer.length,
                        sampleRate: audioBuffer.sampleRate,
                        numberOfChannels: audioBuffer.numberOfChannels
                    });
                    var sourceNode = audioContext.createBufferSource();

                    sourceNode.buffer = audioBuffer; // set PCM data
                    sourceNode.connect(audioContext.destination); // PCM -> SPEAKER
                    sourceNode.start(0); // playback scheduling

                    test.done(pass());
                }, function(error) {
                    console.error("decodeAudioData error", error);
                    test.done(miss());
                });

            });

        }, function(error) {
            console.error(error.message);
            test.done(miss());
        });
    });
}

return test.run();

})(GLOBAL);

