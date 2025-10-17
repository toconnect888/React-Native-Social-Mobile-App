import { Image } from "react-native";

export default function LogoTitle() {
    return (
      <Image
        style={{ width: 150, height: 50 }}
        source={require('../assets/no_tag_logo.png')}
      />
    );
  }