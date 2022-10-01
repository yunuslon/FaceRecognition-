import {RNCamera} from 'react-native-camera';

import {
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import React, {PureComponent} from 'react';
import FaceSDK, {
  Enum,
  MatchFacesImage,
  MatchFacesRequest,
  MatchFacesResponse,
  MatchFacesSimilarityThresholdSplit,
} from '@regulaforensics/react-native-face-api';

var image1 = new MatchFacesImage();
var image2 = new MatchFacesImage();

export class Camera extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      box: null,
      match: false,
      dataRegis: this.props.route.params.dataImg,
    };
  }

  handlerFace = ({faces}) => {
    var trigger = faces[0] ? true : false;
    if (trigger) {
      this.setState({
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
      this.setState({box: null});
    }
  };

  shapeFace = () => {
    if (this.state.box) {
      return (
        <View
          style={styles.bound({
            width: this.state.box?.boxs.width,
            height: this.state.box?.boxs.height,
            x: this.state.box?.boxs.x,
            y: this.state.box?.boxs.y,
          })}>
          <Text style={styles.faceTxt}>Wajah Terdeteksi</Text>
        </View>
      );
    }
  };
  takePicture = async () => {
    image1.bitmap = dataRegis.bitmap;
    image1.imageType = dataRegis.type;
    image2 = new MatchFacesImage();
    try {
      const data = await this.camera.takePictureAsync({
        quality: 0.5,
        base64: true,
        orientation: 'portrait',
        pauseAfterCapture: true,
        height: 800,
        width: 800,
        fixOrientation: true,
      });
      // this.setState({imageData: data.base64, uri: data.uri});
      image2.bitmap = data.base64;
      image2.imageType = Enum.ImageType.PRINTED;
      this.matchingface();
      console.log('dd:', data);
    } catch (err) {
      console.log('err: ', err);
    }
  };

  buttonAksi() {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignSelf: 'flex-start',
          width: '100%',
        }}>
        <View style={{flexDirection: 'row', paddingLeft: '40%'}}>
          {/* //TODO Button Capture Image  */}
          <TouchableHighlight
            style={styles.capture}
            onPress={this.takePicture.bind(this)}
            activeOpacity={1.0}
            underlayColor="rgba(255, 255, 255, 0.5)">
            <View />
          </TouchableHighlight>
        </View>
      </View>
    );
  }
  matchingface() {
    var request = new MatchFacesRequest();
    request.images = [image1, image2];
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
            if (split.matchedFaces.length > 0) {
              // this.props.navigation.navigate('Dashboard', {
              //   persent: (split.matchedFaces[0].similarity * 100).toFixed(2),
              // });
              console.log(split.matchedFaces[0].similarity * 100).toFixed(2);
            } else {
              Alert.alert('dont match face');
            }
            console.log('spilte:', split);
          },
          e => console.log(e),
        );
      },
      e => console.log(e),
    );
  }
  render() {
    return (
      <View style={styles.container}>
        <RNCamera
          ref={ref => {
            this.camera = ref;
          }}
          autoFocus={RNCamera.Constants.AutoFocus.on}
          style={styles.preview}
          onFacesDetected={this.handlerFace}
          // flashMode={RNCamera.Constants.FlashMode.on}
          faceDetectionLandmarks={
            RNCamera.Constants.FaceDetection.Landmarks.all
          }
          type={RNCamera.Constants.Type.front}
          androidCameraPermissionOptions={{
            title: 'Permission to use camera',
            message: 'We need your permission to use your camera',
            buttonPositive: 'Ok',
            buttonNegative: 'Cancel',
          }}
          captureAudio={false}>
          {this.shapeFace()}
          {this.buttonAksi()}
        </RNCamera>
      </View>
    );
  }
}

export default Camera;

const styles = StyleSheet.create({
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
