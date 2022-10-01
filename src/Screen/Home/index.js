import {Alert, StyleSheet, Text, Touchable, View} from 'react-native';
import React from 'react';
import {TouchableOpacity} from 'react-native-gesture-handler';
import FaceSDK, {
  Enum,
  FaceCaptureResponse,
} from '@regulaforensics/react-native-face-api';

const Home = ({navigation}) => {
  const [imgRegis, setimgRegis] = React.useState(null);
  console.log(imgRegis);
  const pickImage = () => {
    Alert.alert(
      'Select option',
      '',
      [
        {
          text: 'Use gallery',
          onPress: () =>
            launchImageLibrary({includeBase64: true}, response => {
              setimgRegis({
                bitmap: response.base64,
                type: Enum.ImageType.PRINTED,
              });
            }),
        },
        {
          text: 'Use camera',
          onPress: () =>
            FaceSDK.presentFaceCaptureActivity(
              result => {
                setimgRegis({
                  bitmap: FaceCaptureResponse.fromJson(JSON.parse(result)).image
                    .bitmap,
                  type: Enum.ImageType.PRINTED,
                });
              },
              e => {},
            ),
        },
      ],
      {cancelable: true},
    );
  };
  React.useEffect(() => {
    if (imgRegis != null) {
      navigation.navigate('Login', {dataImg: imgRegis});
    }
  }, [imgRegis]);

  return (
    <View style={styles.page}>
      <TouchableOpacity onPress={() => pickImage()} style={styles.btn}>
        <Text style={styles.txt}>Register your face</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Home;

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
  },
  txt: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 10,
    marginVertical: 15,
  },
});
