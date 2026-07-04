import React from 'react';
import { Onboarding, SlideItem } from '../../components/onboarding';
import Font from '../../utils/Font';
import { StyleSheet, View, Dimensions } from 'react-native';
import useAppTheme from '../../hooks/theme/useAppTheme';
import OnboardingWordToSlot from '../../components/onboarding-word-to-slot/OnboardingWordToSlot';
import LocalImageComponent from '../../components/image-components/LocalImageComponent';
import OnboardingConnectingLetters from '../../components/onboarding-connecting-letters/OnboardingConnectingLetters';
import DoKalamLogoAnimation from '../../components/DoKalamLogoAnimation';
import { IS_TABLET_CONDITION } from '../../utils/constants/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width} = Dimensions.get("window")
const imageWidth = IS_TABLET_CONDITION ? 450 : width - 80
const slidesData: SlideItem[] = [
  {
    id: '1',
    title: 'خوش آمدید',
    description: 'تو این دنیای بی حساب، دو کلام، حرف حساب بازی کنید!',
    CustomComponent: ()=>{
      return<DoKalamLogoAnimation
        animate={true}
      />
    }
  },
  {
    id: '2',
    title: 'حرف حساب بسازید!',
    description: 'برای ساختن یک حرف حساب، که می‌تواند یک جمله، ضرب المثل یا شعر باشد، کلمات معلق را به ترتیب درست در خانه‌های خالی بچینید.',
    CustomComponent: ()=>{
      return<OnboardingWordToSlot
        data={[
          {word:"بسی", unknown_word: false, assigned : true},
          {word:"رنج", unknown_word: false},
          {word:"بردم", unknown_word: false},
          {word:"در این", unknown_word: false},
          {word:"سال سی", unknown_word: false},
        ]}
      />
    }
  },
  {
    id: '3',
    title: 'کلمات نامعلوم را کشف کنید.',
    description: 'اگر در بین کلمات معلق، روی کارتی علامت سؤال بود، ابتدا باید کلمهٔ مربوط به آن کارت را کشف کنید.',
    CustomComponent: ()=>{
      return<OnboardingWordToSlot
        data={[
          {word:"عجم", unknown_word: false},
          {word:"زنده", unknown_word: true},
          {word:"کردم", unknown_word: false, assigned : true},
          {word:"بدین", unknown_word: false, assigned : true},
          {word:"پارسی", unknown_word: false, assigned : true},
        ]}
      />
    }
  },
  {
    id: '4',
    title: 'بازی کلمات',
    description: 'برای حل چالش کشف کلمهٔ نامعلوم، باید به همراه آن تعدادی نیز کلمات اضافه پیدا کنید. برای ساختن یک کلمه، روی حروف معلق به ترتیب ضربه بزنید.',
    CustomComponent: ()=>{
      return<OnboardingConnectingLetters
        data={{
          word : "زنده",
          word_builded : true,
          additional_words: ["نزد", "زن"],
          additional_words_builded: ["زن"],
          letters : ["ز", "ن", "د", "ه"]
        }}
      />
    }
  },
  {
    id: '5',
    title: 'بازی‌های داستانی',
    description: "بسته‌های بازی، که در آن‌ها باید داستان‌های مختلف را بازی کنید.",
    imageSource: require("../../assets/image/story-cards.png"),
    imageStyle:{width:imageWidth, height:imageWidth, borderRadius:20}
  },
  {
    id: '6',
    title: 'زبان‌های مختلف',
    description: "محتوای دوکلام شامل زبان های مختلفی مانند فارسی، ترکی، لری، کردی (و به زودی زبان‌های دیگر) می‌باشد که می‌توانید آن‌ها را بازی کنید.",
    imageSource: require("../../assets/image/language-cards.png"),
    imageStyle:{width:imageWidth, height:imageWidth, borderRadius:20}
  },
];

const IntroOnboarding = (props:any) => {
  const colors = useAppTheme()

  const finishOnboarding = async() =>{
    await AsyncStorage.setItem("onboarded", "1")
    props.navigation.navigate("SignIn")
  }
  
  return (
    <View style={[styles.container, {backgroundColor:colors.background.a1}]}>
      <Onboarding 
        isRTL={true}
        data={slidesData} 
        onFinish={finishOnboarding} 
        nextButtonColor={colors.primary.a3}
        doneButtonColor={colors.primary.a1}
        titleStyle={{fontFamily:Font.bakh_bold, fontSize:18, color:colors.text.a1}}
        descriptionStyle={{fontFamily:Font.bakh_regular, fontSize:14, color:colors.text.a2}}
      />
    </View>
  );
};
const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
});

export default IntroOnboarding;