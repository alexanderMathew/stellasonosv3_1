import { StatusBar } from 'expo-status-bar';
import { Text, View, TouchableOpacity } from 'react-native';

// Utils and other pages
import { ContainerStyles, ButtonStyles, TextStyles } from '../utils/styles';

export default function Placeholder({ route, navigation }) {
  const { image } = route.params;

  return (
    <View style={ContainerStyles.defaultContainer}>
      <Text style={TextStyles.blackTextMedium}>Placeholder image page</Text>
      <Text style={TextStyles.blackTextSmall}>Image selected: {image.title}</Text>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={ButtonStyles.blackButton}>
        <Text style={TextStyles.whiteTextSmall}>Go back</Text>
      </TouchableOpacity>
      {/* navigation.popToTop() DOESN'T WORK
      <TouchableOpacity
        onPress={() => navigation.popToTop()}
        style={ButtonStyles.blackButton}>
        <Text style={TextStyles.whiteTextSmall}>Go to Intro screen</Text>
      </TouchableOpacity> */}
      <StatusBar style="auto" />
    </View>
  );
}

