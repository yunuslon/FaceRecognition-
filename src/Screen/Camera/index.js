import {
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React from 'react';
import FaceSDK, {
  Enum,
  MatchFacesImage,
  MatchFacesRequest,
  MatchFacesResponse,
  MatchFacesSimilarityThresholdSplit,
} from '@regulaforensics/react-native-face-api';
import {RNCamera} from 'react-native-camera';
import {useCamera} from 'react-native-camera-hooks';
import {takePicture} from 'react-native-camera-hooks/src/takePicture';
import {useRoute} from '@react-navigation/native';

var image1 = new MatchFacesImage();
var image2 = new MatchFacesImage();

const Camera = ({initialProps, navigation}) => {
  const [{cameraRef, type, ratio, autoFocus, autoFocusPoint, isRecording}] =
    useCamera(initialProps);
  const route = useRoute();
  const dataRegis = route.params.dataImg;

  const [state, setState] = React.useState({
    box: null,
  });
  const [time, setTime] = React.useState(5);
  const [loading, setLoading] = React.useState(false);
  const [ResetTime, setResetTime] = React.useState(false);
  const timerRef = React.useRef(time);

  React.useEffect(() => {
    const timerId = setInterval(() => {
      if (ResetTime) {
        timerRef.current = 5;
      } else {
        timerRef.current -= 1;
      }
      if (timerRef.current < 0) {
        clearInterval(timerId);
      } else {
        setTime(timerRef.current);
      }
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, [ResetTime]);

  React.useEffect(() => {
    if (time <= 0) {
      takePictureFunc();
    }
  }, [time]);

  const handlerFace = ({faces}) => {
    var trigger = faces[0] ? true : false;
    if (trigger) {
      setResetTime(false);
      setState({
        box: {
          boxs: {
            width: faces[0].bounds.size.width,
            height: faces[0].bounds.size.height,
            x: faces[0].bounds.origin.x,
            y: faces[0].bounds.origin.y,
            yawAngle: faces[0].yawAngle,
            rollAngle: faces[0].rollAngle,
          },
          rightEyePosition: faces[0].rightEyePosition,
          leftEyePosition: faces[0].leftEyePosition,
          bottomMounthPosition: faces[0].bottomMounthPosition,
        },
      });
    } else {
      setState({box: null});
      setResetTime(true);
    }
  };

  const shapeFace = () => {
    if (state.box) {
      return (
        <View
          style={styles.bound({
            width: state.box?.boxs.width,
            height: state.box?.boxs.height,
            x: state.box?.boxs.x,
            y: state.box?.boxs.y,
          })}>
          <Text style={styles.countTxt}>Tahan selama {time} detik</Text>
          <Text style={styles.faceTxt}>Wajah Terdeteksi</Text>
        </View>
      );
    }
  };

  const takePictureFunc = async () => {
    setLoading(true);
    try {
      image1.bitmap = dataRegis.bitmap;
      image1.imageType = dataRegis.type;
      image2 = new MatchFacesImage();
      const data = await takePicture(
        {cameraRef},
        {
          quality: 0.5,
          base64: true,
          orientation: 'portrait',
          pauseAfterCapture: true,
          height: 800,
          width: 800,
          fixOrientation: true,
        },
      );
      // this.setState({imageData: data.base64, uri: data.uri});
      image2.bitmap = data.base64;
      image2.imageType = Enum.ImageType.PRINTED;
      MatchFace(image1, image2);
    } catch (err) {
      setLoading(false);

      console.log('err: ', err);
    }
  };

  const MatchFace = (data1, data2) => {
    var request = new MatchFacesRequest();
    request.images = [data1, data2];
    FaceSDK.matchFaces(
      JSON.stringify(request),
      response => {
        response = MatchFacesResponse.fromJson(JSON.parse(response));
        FaceSDK.matchFacesSimilarityThresholdSplit(
          JSON.stringify(response.results),
          0.75,
          str => {
            var split = MatchFacesSimilarityThresholdSplit.fromJson(
              JSON.parse(str),
            );
            setLoading(false);
            if (split.matchedFaces.length > 0) {
              navigation.navigate('Dashboard', {
                persent: (split.matchedFaces[0].similarity * 100).toFixed(2),
              });
            } else {
              navigation.goBack();
            }
            console.log('spilte:', split);
          },
          e => console.log(e),
        );
      },
      e => console.log(e),
    );
  };

  return (
    <View style={styles.container}>
      <RNCamera
        ref={cameraRef}
        autoFocus={autoFocus}
        style={styles.preview}
        onFacesDetected={handlerFace}
        faceDetectionLandmarks={RNCamera.Constants.FaceDetection.Landmarks.all}
        type={RNCamera.Constants.Type.front}
        androidCameraPermissionOptions={{
          title: 'Permission to use camera',
          message: 'We need your permission to use your camera',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancel',
        }}
        captureAudio={false}>
        {loading && (
          <View style={styles.pageLoading}>
            <ActivityIndicator color={'#2a9c56'} />
          </View>
        )}
        {!loading && shapeFace()}
      </RNCamera>
    </View>
  );
};

export default Camera;

const styles = StyleSheet.create({
  pageLoading: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
  },
  bound: ({width, height, x, y}) => {
    return {
      position: 'absolute',
      top: y,
      left: x - 50,
      height,
      width,
      borderWidth: 3,
      borderColor: 'green',
      zIndex: 3000,
    };
  },
  faceTxt: {
    backgroundColor: 'green',
    color: 'white',
    textAlign: 'center',
    textAlignVertical: 'center',
    padding: 2,
    fontSize: 10,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  countTxt: {
    color: 'red',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 15,
    position: 'absolute',
    top: -25,
    left: '2%',
    width: '100%',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  capture: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 15,
    marginBottom: 45,
  },
});
