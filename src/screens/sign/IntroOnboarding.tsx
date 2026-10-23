import React from 'react';
import { Onboarding, SlideItem } from '../../components/onboarding';
import Font from '../../utils/Font';
import { StyleSheet, View, Dimensions } from 'react-native';
import useAppTheme from '../../hooks/theme/useAppTheme';
import OnboardingWordToSlot from '../../components/onboarding-word-to-slot/OnboardingWordToSlot';
import LocalImageComponent from '../../components/image-components/LocalImageComponent';
import OnboardingConnectingLetters from '../../components/onboarding-connecting-letters/OnboardingConnectingLetters';
import HarfHesabLogoAnimation from '../../components/HarfHesabLogoAnimation';
import { IS_TABLET_CONDITION } from '../../utils/constants/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width} = Dimensions.get("window")
const imageWidth = IS_TABLET_CONDITION ? 450 : width - 80
const slidesData: SlideItem[] = [
  {
    id: '1',
    title: 'به بازی «حرف حساب» خوش آمدی!',
    description: `تو این دنیای بی‌حساب، دو کلام، حرف حساب بازی کن!\n\nتو «حرف حساب» با کلمات، جمله‌ها و داستان‌ها بازی کن و از دنیای واژه‌ها لذت ببر.`,
    CustomComponent: ()=>{
      return<HarfHesabLogoAnimation
                animate={true}
                size={150}
                colors={{
                    primary: "#FFB938",    // حلقه‌ها و جرقه‌ها
                    secondary: "#5CE1E6",  // جرقه‌ی دوم و حلقه‌ی بیرونی
                    sunInner: "#FFD84A",   // زرد مرکز نور (جدید)
                    sunOuter: "#FF8A1F",   // نارنجی لبه‌ی نور (جدید)
                }}
                onPress={() => {}}
                onReady={() => {}}
            />
    }
  },
  {
    id: '2',
    title: 'حرف حساب بساز!',
    description: 'برای ساختن یک «حرف حساب» که می‌تونه جمله، ضرب‌المثل یا شعر باشه، کلمات معلق رو به‌ترتیب درست در خانه‌های خالی بچین.',
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
    title: 'کلمات نامعلوم را کشف کن.',
    description: 'اگر روی یکی از کارت‌های معلق علامت سؤال دیدی، آن را لمس کن تا کلمهٔ نامعلوم را کشف کنی.',
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
    description: 'برای کشف کلمهٔ نامعلوم، باید چند کلمهٔ اضافه هم بسازی. برای ساختن هر کلمه، حروف معلق رو به‌ترتیب لمس کن.',
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
    title: 'خان کلمات',
    description: 'با ساختن کلمات از حروف معلق، از خان‌های مختلف عبور کن و مهارت واژه‌سازی‌ات رو در زبان‌های مختلف به چالش بکش.',
    CustomComponent: ()=>{
      return<OnboardingConnectingLetters
        data={{
          additional_words: ["مادر", "مرد", "سرد"],
          additional_words_builded: ["مادر"],
          letters : ["م", "ا", "د", "ر", "س"]
        }}
      />
    }
  },
  {
    id: '6',
    title: 'بازی‌های داستانی',
    description: 'داستان‌ها و شعرها رو جمله‌به‌جمله یا بیت‌به‌بیت کامل کن و با چیدن کلمات، روایت رو پیش ببر.',
    imageSource: require("../../assets/image/story-cards.png"),
    imageStyle:{width:imageWidth, height:imageWidth, borderRadius:20}
  },
  {
    id: '7',
    title: 'زبان‌های مختلف',
    description: "محتوای «حرف حساب» شامل زبان های مختلفی مانند فارسی، ترکی، لری، کردی می‌باشد که می‌توانی هر کدام را که خواستی بازی کنی.",
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
        titleStyle={{fontFamily:Font.bakh_bold, fontSize:18, color:colors.primary.a3}}
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