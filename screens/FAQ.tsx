import React from 'react';
import { SafeAreaView, SectionList, StyleSheet, View } from 'react-native';
import { Text } from '../src/components/Text';
import { Colors } from '../styles/colors';

export const FAQScreen = (): JSX.Element => {
  const DATA = [
    {
      title: 'Are there in-app purchases in the Classmates™ Mobile App?',
      data: ['Currently, there are no in-app purchases in the Classmates™ Mobile App.']
    },
    {
      title: 'How do I access my CM+ benefits in the Classmates™ Mobile App?',
      data: ['At this time, members with CM+ benefits will only be able to access their membership benefits on the Classmates® website.']
    },
    {
      title: 'How do I access the Classmates™ Mobile App?',
      data: ['To access the Classmates™ Mobile App, you must be an existing Classmates® member and use a smartphone which supports an Apple or Android operating system.', 
      'If you would like to create a membership, go to the Classmates® website.', 
      'Once you have registered on the Classmates® website, download the app from the appropriate app store and login.']
    },
    {
      title: 'Why can\'t I register using the Classmates™ Mobile App?',
      data: ['Currently, the Classmates™ Mobile App is available only for existing members of Classmates®', 
      'If you would like to create a Classmates membership, go to the Classmates® website.', 
      'Once you have registered, you can login and use the Classmates™ Mobile App.']
    },
    {
      title: 'How can I report inappropriate content on the Classmates™ Mobile App?',
      data: ['If you see inappropriate content on the Classmates™ Mobile App, please let us know by clicking on the flag at the top right corner using the Report link associated with the profile or photo.', 
      'Please be assured that we will review the content that is reported and take the appropriate action as outlined in our Terms of Service. Please understand that because situations and interpretations vary, we also reserve the right not to take any action.', 
      'For more information, please see the Member Conduct section of our Terms of Service.']
    },
    {
      title: 'How do I view my schoolmate\'s photos in the Classmates™ Mobile App?',
      data: ['To view your schoolmates\' photos in the Classmates™ Mobile App, make sure you are on your home page and then click the Photos icon in the bottom banner. Next, click on the box with your grad year photos and if there are photos, they will automatically populate. If you are associated with multiple schools, it will default to your primary affiliation.',
      'If you are affiliated with multiple schools, you can view photos for those schools by clicking the top banner and choosing the school.',
      'Tapping on the photos show a mini profile for the member who posted them. You can also view their full profile by clicking on their name.         ']
    },
    {
      title: 'How do I view or edit my own profile in the Classmates™ Mobile App?',
      data: ['To view your full profile, click View My Profile at the top of the page. You can also access your profile by clicking the Menu icon and then My Profile.',
      'From your profile, you can add a photo, update your Now and Then pictures or add a story. It will also show all the schools you are affiliated with and associated information. You can also change your primary affiliation by clicking “Make this school my Primary Affiliation”.',
      'Please note that although you will see the number of profile visits, you can only view the visits with a Classmates+ membership and on the Classmates® website.']
    },
    {
      title: 'How do I view or add to my photos in the Classmates™ Mobile App?',
      data: ['First click on View My Profile at the top of the home page. You can also access your profile by clicking the Menu icon and then My Profile.',
      'Your photos will appear below your name and school. Click View All to see all photos on your account.',
      'Click Add a Photo if you want to upload a new picture. You will be given an option to choose which album you would like to add the photo to. Please keep in mind that you may need to enable permissions for Classmates to access your phone\'s gallery.',
      'Note: All photos must be in an accepted, common image format (JPEG, PNG, etc.) and less than 10 MB in size.']
    },
    {
      title: 'How do I view a schoolmate\'s profile in the Classmates™ Mobile App?',
      data: ['To search for a specific member of your grad year, click the Class List icon in the bottom banner and navigate to the member. You can view their full profile by clicking their name.',
      'Please note that the Classmates™ Mobile App currently only supports viewing profiles of members associated to your school and grad year. You will not be able to search or view members not affiliated with your school and grad year.']
    },
    {
      title: 'How do I view my Class List in the Classmates™ Mobile App?',
      data: ['To view your Class List in the Classmates™ Mobile App, click the Class List icon in the bottom banner. Your grad year Class List will automatically populate. If you are associated with multiple schools, it will default to your primary affiliation.',
      'If you are affiliated with multiple schools, you can view the Class List for those schools by clicking the top banner and choosing the school.']
    },
    {
      title: 'How do I reset my password in the Classmates™ Mobile App?',
      data: ['If you have forgotten or misplaced your password, click Forgot? on the login page and follow the prompts. We will send you an email with a link to reset your password—simply follow the instructions to choose a new password and log in.',
      'Please make sure that you are not using any email filtering programs that would block email from Classmates.',
      'Important Note: If you have not received your password email within 15 minutes, please check your spam or bulk/promotional email folder, and make sure to add Classmates to your address book/contact list.']
    },
    {
      title: 'How do I manage my account in the Classmates™ Mobile App?',
      data: ['Currently, any account maintenance (except password reset requests) must be completed on the Classmates® website. For more information on how to manage your account, update your information or email preferences, please visit the Help Center on Classmates®.',
      'Note: If you would like to cancel a paid Classmates+ membership, you will need to do so on the Classmates® website. There won’t be membership and billing options in your app store or phone settings. For more information on how to cancel your paid membership, please visit the Help Center on Classmates®.']
    },
    {
      title: 'What is the Classmates™ Mobile App?',
      data: ['The Classmates™ Mobile App is an app available to both Apple and Android users. The mobile app is free to download and use. It provides existing members the ability to view their profile, Class List, and photos. Please note that some services available on the Classmates® website are not currently available in the mobile app. Please watch for future updates about available features on the Classmates™ Mobile App.',
      'The Classmates™ Mobile App is available to download on mobile device operating systems that are currently supported by Apple and Android.']
    }
  ];

  const Item = ({ title }: { title: string}) => (
    <View style={styles.item}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.faqHeader}>About the Classmates<Text style={{ fontSize: 22 }}>™</Text> Mobile App</Text>

      <SectionList
        stickySectionHeadersEnabled={false}
        sections={DATA}
        keyExtractor={(item, index) => item + index}
        renderItem={({ item }) => <Item title={item} />}
        renderSectionHeader={({ section: { title }}) => (
          <Text style={styles.header}>{title}</Text>
          )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  faqHeader: {
    fontSize: 28, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    backgroundColor: Colors.whiteRGBA(), 
    margin: 10,
    padding: 15
  },
  item: {
    backgroundColor: Colors.whiteRGBA(),
    padding: 10,
    paddingLeft: 25,
    paddingRight: 25
  },
  header: {
    fontSize: 20,
    backgroundColor: Colors.whiteRGBA(),
    padding: 25,
    paddingTop: 35,
    marginTop: 0,
    fontWeight: 'bold'
  },
  title: {
    fontSize: 18
  }
});
