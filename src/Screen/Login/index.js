import {Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {useRoute} from '@react-navigation/native';
import FaceSDK, {
  Enum,
  FaceCaptureResponse,
  MatchFacesImage,
  MatchFacesRequest,
  MatchFacesResponse,
  MatchFacesSimilarityThresholdSplit,
} from '@regulaforensics/react-native-face-api';

var image1 = new MatchFacesImage();
var image2 = new MatchFacesImage();

const Login = ({navigation}) => {
  const route = useRoute();
  const [imgLog, setImgLog] = React.useState(null);

  const dataRegis = route.params.dataImg;
  console.log('login:', dataRegis);

  const loginAction = () => {
    image1.bitmap = dataRegis.bitmap;
    image1.imageType = dataRegis.type;
    image2 = new MatchFacesImage();
    FaceSDK.presentFaceCaptureActivity(
      result => {
        image2.bitmap = FaceCaptureResponse.fromJson(
          JSON.parse(result),
        ).image.bitmap;
        image2.imageType = Enum.ImageType.PRINTED;
        setImgLog({
          bitmap: FaceCaptureResponse.fromJson(JSON.parse(result)).image.bitmap,
          type: Enum.ImageType.PRINTED,
        });
      },
      e => {},
    );
  };

  const MatchFace = () => {
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
              navigation.navigate('Dashboard', {
                persent: (split.matchedFaces[0].similarity * 100).toFixed(2),
              });
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
  };

  React.useEffect(() => {
    if (imgLog != null) {
      MatchFace();
    }
  }, [imgLog]);

  return (
    <View style={styles.page}>
      <TouchableOpacity onPress={() => loginAction()} style={styles.btn}>
        <Text style={styles.txt}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate('Camera', {dataImg: dataRegis})}
        style={styles.btn}>
        <Text style={styles.txt}>Login with RNCam</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  page: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'white',
  },
  btn: {
    backgroundColor: 'green',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,

    marginBottom: 20,
  },
  txt: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 10,
    marginVertical: 15,
  },
});
