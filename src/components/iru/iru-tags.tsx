import React, { useEffect, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Colors } from '../../../styles/colors'
import { StudentModel } from '../../../types/interfaces'
import Icon from 'react-native-vector-icons/FontAwesome'
import { useMutation, useQuery } from '@apollo/client'
import { AvailableIruWordsResponse, GET_AVAILABLE_IRU_WORDS, GET_IRU_WORDS, Iru, IruWord, IruWordsResponse } from '../../../data/queries/iru/words'
import { Button } from '../Button'
import { globalStyles } from '../../../styles/global-stylesheet'
import { titleize } from '../../helpers/string'
import { addIruTagInput, addIruTagResponse, ADD_TAG_TO_USER, GET_TAGGED_IRUS, IruTag, removeIruWordInput, REMOVE_IRU_WORDS, TaggedIrusResponse } from '../../../data/queries/iru/tags'
import { useCurrentUserId, useIsSignedIn } from '../../../redux/hooks'
import { Placeholder, Fade, PlaceholderLine } from 'rn-placeholder'
import { Modal } from '../Modal'
import { ScrollView } from 'react-native-gesture-handler'
import { IruTagsContainer } from './iru-tags-container'
import { TagsAddOrUpdate, TagToAddOrUpdate } from './iru-tag-label'
import { Text } from '../Text'
import { DividerLine } from '../DividerLine'
import { logEvent } from '../../helpers/analytics'
import BasicAlert from '../BasicAlert'

type ScrollViewRef = ScrollView & {
  flashScrollIndicators: () => void
};

interface ContentProps {
  student: StudentModel
}

export const IruTags = ({ student }: ContentProps): JSX.Element => {
  const scrollViewRef = React.useRef<ScrollViewRef | null>(null);
  const currentUserId = useCurrentUserId();
  const isCurrentUser = useIsSignedIn(student.personId);
  const {
    firstName,
    personId,
  } = student;

  const iruWordsVariables = {
    personId,
    limit: 100,
    offset: 0,
  };

  /**
   * This will return the words that are already tagged on the current profile
   */
  const { data: wordsData, loading: wordsLoading, refetch: refetchWords } = useQuery<IruWordsResponse>(GET_IRU_WORDS, {
    variables: iruWordsVariables,
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-first',
  });

  /**
   * This will return the available words to be tagged on the current profile.
   */
  const { data: availableWordsData, loading: availableWordsLoading } = useQuery<AvailableIruWordsResponse>(GET_AVAILABLE_IRU_WORDS, {
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-first',
  });

  /**
   * This will return the tags that the current user has tagged on the current profile,
   * will be used to compare and allow the option to remove a tag and prevent
   * the current from adding the same word more than once.
   */
  const { data: taggedIrusData, loading: taggedIrusLoading, refetch: refetchTaggedIrus } = useQuery<TaggedIrusResponse>(GET_TAGGED_IRUS, {
    variables: {
      personId: student.personId,
    },
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-first',
  });

  const [ addIruTag, {
    data: addIruTagData,
    loading: addIruTagLoading,
  } ] = useMutation<addIruTagResponse>(ADD_TAG_TO_USER);

  const [ removeWord, {
    data: removeWordData,
    error: removeWordError,
    loading: removeWordLoading,
  } ] = useMutation<addIruTagResponse>(REMOVE_IRU_WORDS)

  const [ hasWords, setHasWords ] = useState(false);
  const [ taggedWords, setTaggedWords ] = useState<IruWord[]>([]);
  const [ taggedIrus, setTaggedIrus ] = useState<IruTag[]>([]);
  const [ availableWords, setAvailableWords ] = useState<Iru[]>([]);
  const [ isLoading, setIsLoading ] = useState(false);
  const [ isModalVisible, setIsModalVisible ] = useState(false);
  const [ tagsAddOrUpdate, setTagsAddOrUpdate ] = useState<TagsAddOrUpdate>({});
  const [ tagsToDisplayInModal, setTagsToDisplayInModal ] = useState<TagToAddOrUpdate[]>([]);
  const [ totalTaggedWords, setTotalTaggedWords ] = useState(0);
  const [ totalTaggedWordsToDisplay, setTotalTaggedWordsToDisplay ] = useState(0);
  const [ showMore, setShowMore ] = useState(false);
  const [ showSuccessModal, setShowSuccessModal ] = useState(false);
  const [ successWords, setSuccessWords ] = useState<string[]>([]);
  const [ isMounted, setIsMounted ] = useState(true);
  const [ shouldSaveTags, setShouldSaveTags ] = useState(false);

  useEffect(() => {
    return () => {
      setIsMounted(false);
    }
  }, [])


  /**
   * !hasWords: a Flag that defines if the current profile has or hasn't previously tagged words
   * !taggedWords: the words that are already tagged on the current profile
   * !taggedIrus: the tags that the current user has tagged on the current profile
   * !availableWords: the available words to be tagged on the current profile
   * !isLoading: a Flag that defines if we should show the placeholder, it is true if one of these is true:
   *      !> wordsLoading
   *      !> taggedIrusLoading
   *      !> addIruTagLoading
   *      !> removeWordLoading
   * !isModalVisible: a Flag for showing or hidding the tags modal.
   * !tagsAddOrUpdate: Will contain the tags that requires to be added or updated
   * !tagsToDisplayInModal: Contains the array of tags to display on the modal
   */

  useEffect(() => {
    if (!isMounted) {
      return;
    }
    if (taggedIrus) {
      const tagged: string[] = taggedIrus.reduce((prev: string[], curr): string[] => {
        const words = curr.words || [];
        return [
          ...prev,
          ...words,
        ]
      }, []);
      setTotalTaggedWordsToDisplay(tagged.length);
      setTotalTaggedWords(tagged.length)
    }
    if (availableWords.length) {
      setTagsToDisplayInModal(availableWords.map((iru: Iru) => {
        const {
          id
        } = iru;
        const iruTags = taggedWords.find((t) => t.id === id)?.iruTags || [];
        const taggedIrusIds = taggedIrus.map((i) => i.iruTagId);
        const taggedObject = iruTags.find((tag) => taggedIrusIds.includes(tag.iruTagId));
        const isTaggedByMe = !!(taggedObject);
        const isTaggedByOther =
          (isTaggedByMe && iruTags.length === 1) ? false : ((() => !!(iruTags.length))());
        return {
          iru: iru,
          byMe: isTaggedByMe,
          byOther: isTaggedByOther,
          prevTag: isTaggedByMe ? taggedObject?.iruTagId : undefined
        };
      }, {}));
    }
  }, [availableWords, taggedWords, taggedIrus])

  useEffect(() => {
    if (!isMounted) {
      return;
    }
    if (
      wordsLoading ||
      taggedIrusLoading ||
      addIruTagLoading ||
      removeWordLoading
    ) {
      return setIsLoading(true);
    }
    setIsLoading(false);
  }, [
    wordsLoading,
    wordsData,
    taggedIrusLoading,
    taggedIrusData,
    addIruTagLoading,
    addIruTagData,
    removeWordLoading,
    removeWordData
  ]);

  useEffect(() => {
    if (!isMounted) {
      return;
    }
    if (!wordsLoading && wordsData) {
      setHasWords(!!(wordsData.iruWords.records?.length));
      setTaggedWords(wordsData.iruWords.records || []);
    } else {
      setHasWords(false);
    }
  }, [wordsLoading, wordsData]);

  useEffect(() => {
    if (!isMounted) {
      return;
    }
    if (!taggedIrusLoading && taggedIrusData) {
      setTaggedIrus(taggedIrusData.iruTagsReceivedOrPosted.records || []);
    }
  }, [taggedIrusLoading, taggedIrusData]);

  useEffect(() => {
    if (!isMounted) {
      return;
    }
    if (!availableWordsLoading && availableWordsData) {
      setAvailableWords(availableWordsData.iru);
    }
  }, [availableWordsLoading, availableWordsData]);

  const refetchIruData = () => {
    refetchWords();
    refetchTaggedIrus();
  }

  const _addIruTag = (variables: addIruTagInput, wordStrings: string[], eventName: string) => {
    setSuccessWords(wordStrings);
    return addIruTag({
      variables,
      fetchPolicy: 'no-cache',
    }).then((response) => {
      const {
        iruTagId,
      } = response.data?.addIruTag as IruTag;
      wordStrings.forEach((iru_word) => {
        logEvent(eventName, {
          iru_tagger_id: currentUserId,
          iru_recipient_id: student.personId,
          iru_tag_id: iruTagId,
          iru_word
        });
      });
      setShowSuccessModal(true);
      setTimeout(() => {
        setSuccessWords([]);
        setShowSuccessModal(false);
      }, 5000);
      refetchIruData();
    }, (reason) => {
      let userMessage = 'Oops!! There was an error adding your tag. Try again later.';
      if (reason?.message) {
        userMessage = reason?.message as string;
      }
      BasicAlert.show({
        title: 'IRU Tag',
        text: userMessage,
      });
    })
  }

  useEffect(() => {
    if (!isMounted) {
      return;
    }
    if (!removeWordLoading) {
      if (removeWordError) {
        BasicAlert.show({
          title: 'IRU Tag',
          text: 'Oops!! There was an error removing the word. Try again later.',
        });
        return;
      } else {
        if (removeWordData)
          refetchIruData();
      }
    }
  }, [removeWordLoading, removeWordData, removeWordError])

  const _removeIruWord = async (variables: removeIruWordInput) => {
    removeWord({
      variables,
      fetchPolicy: 'no-cache',
    });
  }

  const _word = (wordData: IruWord) => {
    const {
      id,
      iruTags,
      word,
    } = wordData;
    return (<View
      key={id}
      style={styles.tagContainer}
    >
      <View style={[
          styles.actionLabel,
          styles.actionLeft,
        ]}
      >
        <Text
          style={globalStyles.boldText}
          accessibilityLabel='iru count'
          accessibilityRole='text'
        >
          {iruTags.length}
        </Text>
      </View>
      <Text
        style={styles.tag}
        accessibilityLabel={'iru as ' + word}
        accessibilityRole={'text'}
      >{word}</Text>
      <View style={[
          styles.actionLabel,
          styles.actionRight,
        ]}
      >
        {
          (totalTaggedWords < 10 && !isCurrentUser) && <Icon.Button name="plus-circle"
            accessibilityLabel='IRU plus circle'
            accessibilityRole='button'
            accessible={true}
            size={26}
            color={Colors.darkCyan}
            backgroundColor={'transparent'}
            iconStyle={styles.addButton}
            underlayColor={'transparent'}
            onPress={() => {
              _addIruTag({
                personId: student.personId,
                tagger: currentUserId,
                words: [id],
              }, [word], 'iru_one_click_create');
            }}
          />
        }
      </View>
    </View>)
  }

  const userTags = () => {
    if (showMore)
      return taggedWords.map((word) => _word(word))
    else
      return taggedWords.slice(0,3).map((word) => _word(word))
  }

  const tagsLoader = () => {
    const placeholder = () => (<View
      style={styles.tagContainer}
    >
      <View
        style={{
          width: styles.tag.width + (styles.actionLabel.width * 2),
          backgroundColor: 'red',
          height: styles.actionLabel.width,
          borderRadius: styles.actionRight.borderBottomRightRadius,
          overflow: 'hidden'
        }}
      >
        <PlaceholderLine height={styles.actionLabel.width} />
      </View>
    </View>);
    return (
      <Placeholder
        Animation={Fade}
      >
        <View>
          <PlaceholderLine height={22} />
          <View
            style={styles.tagWrapper}
          >
            {placeholder()}
            {placeholder()}
            {placeholder()}
          </View>
        </View>
      </Placeholder>
    )
  }

  useEffect(() => {
    if (!isMounted) {
      return;
    }
    if (isModalVisible) {
      setTimeout(function () {
        scrollViewRef.current?.flashScrollIndicators();
      }, 500);
    }
  }, [isModalVisible]);

  const _openModal = () => {
    setTagsAddOrUpdate({});
    setIsModalVisible(true);
  }

  const _saveTags = () => {
    if (!shouldSaveTags) return;
    setShouldSaveTags(false);
    const tagsArray: TagToAddOrUpdate[] = Object.values(tagsAddOrUpdate);
    const newTags = tagsArray.filter((tag) => tag.byMe);
    const updateTags = tagsArray.filter((tag) => !tag.byMe && tag.prevTag);
    if (newTags.length) {
      _addIruTag({
        personId: student.personId,
        tagger: currentUserId,
        words: newTags.map(tag => tag.iru.id)
      }, newTags.map(tag => tag.iru.word), 'iru_adjective_create');
    }
    if (updateTags.length) {
      const updateTagsByTagId = updateTags.reduce((prev: {
        [prevTag: string]: TagToAddOrUpdate[]
      }, curr) => {
        const prevTag = curr.prevTag as string;
        const prevData = prev[prevTag] || [];
        return {
          ...prev,
          [prevTag]: [
            ...prevData,
            curr,
          ]
        }
      }, {});
      Object.entries(updateTagsByTagId).forEach((entry) => {
        _removeIruWord({
          tagId: entry[0],
          words: entry[1].map(tag => tag.iru.id)
        });
      })
    }
  }

  const _showMoreTags = () => {
    if (showMore) {
      setShowMore(false)
    } else {
      setShowMore(true);
    }
  }
  return (<View>
    <View>
      {
        (hasWords && !isLoading) && <View>
          <Text
            style={{
              fontWeight: 'bold', fontSize: 22, textAlign: 'center', marginBottom: 25
            }}
          >People remember{`\n${firstName}`} as ...</Text>
          <View
            style={styles.tagWrapper}
          >
            {
              userTags()
            }
          </View>
          {
            taggedWords.length > 3 && <Text
              style={{
                color: Colors.darkCyan,
                textAlign: 'center',
                fontSize: 16,
                fontWeight: 'bold',
                marginBottom: 20
              }}
              onPress={_showMoreTags}
            >{
              showMore ? 'SEE LESS' : 'SEE MORE'
            }</Text>
          }
          {
            (totalTaggedWords < 10 && !isCurrentUser) && (
              <Text
                accessibilityLabel='how do you remember this person'
                accessibilityRole='link'
                accessible={true}
                style={{
                  color: Colors.darkCyan,
                  textAlign: 'center',
                  fontSize: 18,
                  fontWeight: 'bold'
                }}
                onPress={_openModal}
              >How do you remember{`\n${firstName}`}?
              </Text>
            )
          }
        </View>
      }
      {
        (!hasWords && !isLoading && !isCurrentUser) && <View style={{
          marginBottom: 20
        }}
        >
          <Text style={{ fontWeight: 'bold', fontSize: 22, textAlign: 'center', marginBottom: 25 }}>How do you remember{'\n'}{titleize(`${firstName}`)}?</Text>
          <Button
            accessible={true}
            accessibilityLabel='Select your words'
            title="SELECT YOUR WORDS"
            onPress={_openModal}
          />
        </View>
      }
      {
        (isLoading) && tagsLoader()
      }
      <Modal
        isVisible={isModalVisible}
        onClose={() => { setIsModalVisible(false)}}
        swipeDirection={[]}
        propagateSwipe={true}
        onModalHide={_saveTags}
      >
        <View
          style={styles.modalWrapper}
        >
          <Text style={{ fontWeight: 'bold', fontSize: 22, textAlign: 'left', marginBottom: 10 }}>How do you remember {titleize(`${firstName}`)}?</Text>
          <Text style={{ fontWeight: 'normal', fontSize: 16, textAlign: 'left', marginBottom: 20 }}>select your words to tell {titleize(`${firstName}`)}</Text>
          <View
            style={styles.modalTagsContainer}
          >
            {
              <IruTagsContainer
                tagsToDisplayInModal={tagsToDisplayInModal}
                tagsAddOrUpdate={tagsAddOrUpdate}
                scrollViewRef={scrollViewRef}
                onChangeTagged={(tags) => {
                  setTagsAddOrUpdate(tags);
                  const tagsArray: TagToAddOrUpdate[] = Object.values(tags);
                  const newTags = tagsArray.filter((tag) => tag.byMe);
                  setTotalTaggedWordsToDisplay(totalTaggedWords + newTags.length);
                }}
              />
            }
          </View>
          <Text
            accessibilityLabel='words remaining'
            accessibilityRole='text'
            style={{
              textAlign: 'center',
              color: totalTaggedWordsToDisplay <= 10 ? Colors.blackRGBA() : Colors.orange,
              marginVertical: 20,
              fontWeight: totalTaggedWordsToDisplay <= 10 ? 'normal' : 'bold',
            }}
          >{totalTaggedWordsToDisplay} words of 10</Text>
          <View>
            <Button
              accessible={true}
              accessibilityLabel='Share'
              title="SHARE"
              onPress={() => {
                setShouldSaveTags(true);
                setIsModalVisible(false)
              }}
              disabled={totalTaggedWordsToDisplay > 10}
            />
            <Button
              accessibilityLabel='I remember you cancel'
              accessible={true}
              title="CANCEL"
              style={{
                marginTop: 20
              }}
              onPress={() => setIsModalVisible(false)}
              textColor={Colors.darkCyan}
              backgroundColor={Colors.whiteRGBA()}
            />
          </View>
        </View>
      </Modal>
      <Modal
        isVisible={showSuccessModal}
        onClose={() => {
          setSuccessWords([]);
          setShowSuccessModal(false);
        }}
        swipeDirection={[]}
      >
        <View>
          {
            (showSuccessModal && !!successWords.length) && <View style={{
                padding: 30,
              }}
            >
              <Text
                style={{
                  fontWeight: 'bold',
                  color: Colors.blackRGBA(),
                  fontSize: 18,
                  textAlign: 'center'
                }}
              >Thanks for sharing!</Text>
              <Text
                accessibilityLabel='IRU text'
                accessibilityRole='text'
                style={{
                  paddingVertical: 20,
                  textAlign: 'center',
                }}
              >Your remembered {firstName} as {successWords.map((word, index, words) => {
                let separator = '';
                if ((words.length - 2) === index && words.length !== 1) {
                  separator = ' and ';
                } else {
                  if ((words.length - 1) !== index && words.length !== 1) {
                    separator = ', ';
                  }
                }
                return (<Text key={'word-' + word} style={{ fontWeight: 'bold' }}>
                  {word}
                  {
                    separator && <Text style={{ fontWeight: 'normal' }}>{separator}</Text>
                  }
                </Text>)
              })}</Text>
              <Text style={{
                  textAlign: 'center'
                }}
              >We&apos;ll let {firstName} know</Text>
            </View>
          }
        </View>
      </Modal>
    </View>
    {
      (hasWords || !isCurrentUser) && <DividerLine />
    }
  </View>)
}

const styles = StyleSheet.create({
  tagWrapper: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    paddingBottom: 10
  },
  tagContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'center',
  },
  tag: {
    backgroundColor: Colors.ligthCyan,
    color: Colors.blackRGBA(),
    height: 42,
    padding: 13,
    fontSize: 16,
    lineHeight: 16,
    fontWeight: 'bold',
    overflow: 'hidden',
    width: 130,
    textAlign: 'center',
  },
  actionLabel: {
    width: 42,
    height: 42,
    backgroundColor: Colors.ligthCyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLeft: {
    borderTopLeftRadius: 21,
    borderBottomLeftRadius: 21,
    borderRightColor: Colors.whiteRGBA(),
    borderRightWidth: 1,
  },
  actionRight: {
    borderTopRightRadius: 21,
    borderBottomRightRadius: 21,
    borderLeftColor: Colors.whiteRGBA(),
    borderLeftWidth: 1,
  },
  addButton: {
    marginTop: 0,
    marginRight: 0,
    width: 26,
    height: 26
  },
  modalWrapper: {
    width: '100%',
    padding: 20
  },
  modalTagsContainer: {
    width: '100%',
    marginTop: 20,
    height: 200,
  },
  modalTagsWrapper: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'space-between',
    alignSelf: 'center',
  },
});
