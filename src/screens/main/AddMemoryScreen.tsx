import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  RouteProp,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { format, subDays } from 'date-fns';

import {
  RootStackParamList,
  MainTabParamList,
} from '../../types/navigation';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Header } from '../../components/layout/Header';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Photo } from '../../components/common/Photo';
import { useGroupStore } from '../../store/groupStore';
import { memoryApi } from '../../api/memoryApi';
import { MemoryLocation } from '../../types/models';
import {
  colors,
  radius,
  spacing,
  typography,
} from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

type AddMemoryRouteProp = RouteProp<
  MainTabParamList,
  'AddMemory'
>;

export const AddMemoryScreen: React.FC = () => {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList>
    >();

  const route = useRoute<AddMemoryRouteProp>();

  const currentGroup = useGroupStore(
    (state) => state.currentGroup
  );

  const { width: screenWidth } = useWindowDimensions();

  const isSmallScreen = screenWidth < 360;

  const todayStr = format(
    new Date(),
    'yyyy-MM-dd'
  );

  const [selectedDate, setSelectedDate] =
    useState<string>(
      route.params?.initialDate || todayStr
    );

  const [imageUri, setImageUri] =
    useState<string | null>(null);

  const [caption, setCaption] =
    useState<string>('');

  const [location, setLocation] =
    useState<MemoryLocation | null>(null);

  const [fetchingLocation, setFetchingLocation] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (route.params?.initialDate) {
      setSelectedDate(
        route.params.initialDate
      );
    }
  }, [route.params?.initialDate]);

  const activeGroupId = (
    currentGroup?.id ||
    currentGroup?._id
  ) as string;

  // Camera capture
  const handleTakePhoto = async () => {
    try {
      const { status } =
        await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Camera Access Required',
          'CampusCapsule needs camera permissions to take real-time photos with your friends.'
        );
        return;
      }

      const result =
        await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 5],
          quality: 0.8,
        });

      if (
        !result.canceled &&
        result.assets[0]
      ) {
        setImageUri(result.assets[0].uri);
        setError(null);
      }
    } catch (err: any) {
      setError(
        'Could not open camera: ' +
          err.message
      );
    }
  };

  // Gallery select
  const handlePickPhoto = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Gallery Access Required',
          'CampusCapsule needs photo library access to choose your daily memory.'
        );
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 5],
          quality: 0.8,
        });

      if (
        !result.canceled &&
        result.assets[0]
      ) {
        setImageUri(result.assets[0].uri);
        setError(null);
      }
    } catch (err: any) {
      setError(
        'Could not select image: ' +
          err.message
      );
    }
  };

  // Location detection
  const handleGetLocation = async () => {
    try {
      setFetchingLocation(true);

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Location Optional',
          'You can still add memories without location tagging.'
        );
        return;
      }

      const loc =
        await Location.getCurrentPositionAsync({
          accuracy:
            Location.Accuracy.Balanced,
        });

      let readableName = '';

      try {
        const [geocode] =
          await Location.reverseGeocodeAsync({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });

        if (geocode) {
          readableName = [
            geocode.name,
            geocode.city ||
              geocode.subregion,
          ]
            .filter(Boolean)
            .join(', ');
        }
      } catch {
        readableName =
          'University Campus';
      }

      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        readableName:
          readableName || 'Campus Spot',
      });
    } catch (err: any) {
      console.warn(
        'Location detection failed:',
        err
      );
    } finally {
      setFetchingLocation(false);
    }
  };

  const handleRemoveLocation = () => {
    setLocation(null);
  };

  // Available dates for quick missed date selection
  const availableDates = [
    0,
    1,
    2,
    3,
    4,
  ].map((daysAgo) => {
    const d = subDays(
      new Date(),
      daysAgo
    );

    return {
      dateStr: format(
        d,
        'yyyy-MM-dd'
      ),
      label:
        daysAgo === 0
          ? 'Today'
          : daysAgo === 1
            ? 'Yesterday'
            : format(d, 'MMM d'),
    };
  });

  const handleSubmitMemory = async () => {
    if (!activeGroupId) {
      setError(
        'Please select or create a group first.'
      );
      return;
    }

    if (!imageUri) {
      setError(
        'Please take or select a photo for your memory.'
      );
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      /*
       * The selected local image URI is now sent
       * to memoryApi.createMemory().
       *
       * memoryApi converts it into FormData.
       *
       * Backend flow:
       *
       * React Native
       *      ↓
       * FormData
       *      ↓
       * POST /api/memories
       *      ↓
       * Multer
       *      ↓
       * Cloudinary
       *      ↓
       * MongoDB
       */
      await memoryApi.createMemory({
        groupId: activeGroupId,
        imageUri,
        memoryDate: selectedDate,
        caption: caption.trim(),
        location:
          location || undefined,
      });

      Alert.alert(
        'Memory Preserved! 🎓',
        `Your moment for ${selectedDate} has been archived in ${currentGroup?.name}.`,
        [
          {
            text: 'View Timeline',
            onPress: () => {
              setImageUri(null);
              setCaption('');
              setLocation(null);

              navigation.navigate(
                'MainTabs',
                {
                  screen: 'Timeline',
                }
              );
            },
          },
        ]
      );
    } catch (err: any) {
      setError(
        err.message ||
          'Failed to archive memory.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Add Memory"
        subtitle={
          currentGroup
            ? `In: ${currentGroup.name}`
            : undefined
        }
      />

      <ScreenContainer scrollable>
        {error ? (
          <View style={styles.errorBox}>
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color={colors.status.error}
            />

            <Text style={styles.errorText}>
              {error}
            </Text>
          </View>
        ) : null}

        {/* Date Selector */}
        <Text style={styles.sectionHeading}>
          1. Select Memory Date
        </Text>

        <View
          style={styles.dateSelectorRow}
        >
          {availableDates.map(
            (item) => {
              const isSelected =
                selectedDate ===
                item.dateStr;

              return (
                <TouchableOpacity
                  key={item.dateStr}
                  onPress={() =>
                    setSelectedDate(
                      item.dateStr
                    )
                  }
                  style={[
                    styles.datePill,
                    isSelected &&
                      styles.datePillActive,
                    isSmallScreen &&
                      styles.datePillSmall,
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.datePillText,
                      isSelected &&
                        styles.datePillTextActive,
                    ]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={
                      0.8
                    }
                  >
                    {item.label}
                  </Text>

                  <Text
                    style={[
                      styles.datePillSub,
                      isSelected &&
                        styles.datePillSubActive,
                    ]}
                  >
                    {item.dateStr.slice(
                      5
                    )}
                  </Text>
                </TouchableOpacity>
              );
            }
          )}
        </View>

        {/* Photo Selection */}
        <Text style={styles.sectionHeading}>
          2. Photo (Max 1 per day)
        </Text>

        {imageUri ? (
          <View
            style={
              styles.previewContainer
            }
          >
            <Photo
              uri={imageUri}
              style={styles.previewPhoto}
              label="Selected photo unavailable"
            />

            <TouchableOpacity
              style={
                styles.changePhotoBtn
              }
              onPress={() =>
                setImageUri(null)
              }
              activeOpacity={0.7}
            >
              <Ionicons
                name="trash-outline"
                size={16}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.changePhotoText
                }
              >
                Remove Photo
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={
              styles.photoPickerRow
            }
          >
            <TouchableOpacity
              style={
                styles.photoPickerBox
              }
              onPress={
                handleTakePhoto
              }
              activeOpacity={0.8}
            >
              <View
                style={
                  styles.pickerIconCircle
                }
              >
                <Ionicons
                  name="camera"
                  size={26}
                  color={
                    colors.primary[500]
                  }
                />
              </View>

              <Text
                style={
                  styles.pickerBoxTitle
                }
              >
                Take Photo
              </Text>

              <Text
                style={
                  styles.pickerBoxSubtitle
                }
              >
                Camera
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.photoPickerBox
              }
              onPress={
                handlePickPhoto
              }
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.pickerIconCircle,
                  {
                    backgroundColor:
                      colors.secondary[50],
                  },
                ]}
              >
                <Ionicons
                  name="images"
                  size={26}
                  color={
                    colors.secondary[500]
                  }
                />
              </View>

              <Text
                style={
                  styles.pickerBoxTitle
                }
              >
                Select Photo
              </Text>

              <Text
                style={
                  styles.pickerBoxSubtitle
                }
              >
                Gallery
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Location */}
        <Text style={styles.sectionHeading}>
          3. Campus Location (Optional)
        </Text>

        {location ? (
          <View
            style={
              styles.locationActiveCard
            }
          >
            <View
              style={styles.locationInfo}
            >
              <Ionicons
                name="location"
                size={20}
                color={
                  colors.secondary[600]
                }
              />

              <Text
                style={
                  styles.locationActiveText
                }
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {location.readableName}
              </Text>
            </View>

            <TouchableOpacity
              onPress={
                handleRemoveLocation
              }
              style={
                styles.locationRemoveButton
              }
              hitSlop={{
                top: 8,
                bottom: 8,
                left: 8,
                right: 8,
              }}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={
                  colors.light.textMuted
                }
              />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={
              styles.addLocationBtn
            }
            onPress={
              handleGetLocation
            }
            disabled={
              fetchingLocation
            }
            activeOpacity={0.8}
          >
            {fetchingLocation ? (
              <ActivityIndicator
                size="small"
                color={
                  colors.secondary[600]
                }
              />
            ) : (
              <>
                <Ionicons
                  name="location-outline"
                  size={20}
                  color={
                    colors.secondary[600]
                  }
                />

                <Text
                  style={
                    styles.addLocationText
                  }
                >
                  Tag Current Campus
                  Location
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Caption / Memory Note */}
        <Text style={styles.sectionHeading}>
          4. Caption / Memory Note
        </Text>

        <Input
          placeholder="What made this day memorable? (e.g. Celebrated Sarah's birthday after exams!)"
          value={caption}
          onChangeText={
            setCaption
          }
          maxLength={500}
          multiline
          numberOfLines={5}
          style={
            styles.captionInput
          }
          helperText={`${caption.length}/500 characters`}
        />

        {/* Submit */}
        <Button
          title={
            submitting
              ? 'Preserving Memory...'
              : `Archive Memory for ${selectedDate}`
          }
          onPress={
            handleSubmitMemory
          }
          loading={submitting}
          size="lg"
          style={styles.submitBtn}
        />
      </ScreenContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      colors.light.background,
  },

  sectionHeading: {
    fontSize:
      typography.sizes.sm,
    fontWeight:
      typography.weights.bold,
    color:
      colors.light.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: spacing.md,
    marginBottom:
      spacing.xs + 2,
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor:
      colors.status.errorBg,
    padding: spacing.md,
    borderRadius: radius.md,
    marginVertical: spacing.sm,
    gap: spacing.sm,
  },

  errorText: {
    flex: 1,
    fontSize:
      typography.sizes.sm,
    lineHeight:
      typography.lineHeights.sm +
      2,
    color:
      colors.status.error,
    fontWeight:
      typography.weights.medium,
  },

  dateSelectorRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },

  datePill: {
    flex: 1,
    minWidth: 0,
    minHeight: 58,
    paddingVertical: spacing.sm,
    paddingHorizontal:
      spacing.xs,
    backgroundColor:
      colors.light.surface,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor:
      colors.light.border,
  },

  datePillSmall: {
    paddingHorizontal: 2,
  },

  datePillActive: {
    backgroundColor:
      colors.primary[50],
    borderColor:
      colors.primary[500],
  },

  datePillText: {
    maxWidth: '100%',
    fontSize:
      typography.sizes.xs,
    lineHeight:
      typography.lineHeights.xs,
    fontWeight:
      typography.weights.semibold,
    color:
      colors.light.textSecondary,
    textAlign: 'center',
  },

  datePillTextActive: {
    color:
      colors.primary[700],
    fontWeight:
      typography.weights.bold,
  },

  datePillSub: {
    fontSize: 10,
    lineHeight: 13,
    color:
      colors.light.textMuted,
    marginTop: 2,
  },

  datePillSubActive: {
    color:
      colors.primary[600],
  },

  photoPickerRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },

  photoPickerBox: {
    flex: 1,
    minWidth: 0,
    minHeight: 120,
    backgroundColor:
      colors.light.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor:
      colors.light.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal:
      spacing.sm,
    paddingVertical:
      spacing.md,
  },

  pickerIconCircle: {
    width: 46,
    height: 46,
    borderRadius:
      radius.round,
    backgroundColor:
      colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom:
      spacing.xs,
  },

  pickerBoxTitle: {
    maxWidth: '100%',
    fontSize:
      typography.sizes.sm,
    lineHeight:
      typography.lineHeights.sm,
    fontWeight:
      typography.weights.semibold,
    color:
      colors.light.textPrimary,
    textAlign: 'center',
  },

  pickerBoxSubtitle: {
    fontSize:
      typography.sizes.xs,
    lineHeight:
      typography.lineHeights.xs,
    color:
      colors.light.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },

  previewContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 4 / 5,
    maxHeight: 420,
    borderRadius: radius.sm,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    backgroundColor:
      colors.light.surfaceSubtle,
  },

  previewPhoto: {
    width: '100%',
    height: '100%',
  },

  changePhotoBtn: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    backgroundColor:
      'rgba(0,0,0,0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal:
      spacing.md,
    paddingVertical:
      spacing.xs + 2,
    borderRadius:
      radius.round,
  },

  changePhotoText: {
    color: '#FFFFFF',
    fontSize:
      typography.sizes.xs,
    fontWeight:
      typography.weights.semibold,
  },

  addLocationBtn: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor:
      colors.secondary[50],
    paddingHorizontal:
      spacing.md,
    paddingVertical:
      spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor:
      colors.secondary[200],
    marginBottom:
      spacing.sm,
  },

  addLocationText: {
    flex: 1,
    fontSize:
      typography.sizes.sm,
    lineHeight:
      typography.lineHeights.sm +
      2,
    color:
      colors.secondary[700],
    fontWeight:
      typography.weights.semibold,
    textAlign: 'center',
  },

  locationActiveCard: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:
      colors.secondary[50],
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor:
      colors.secondary[200],
    marginBottom:
      spacing.sm,
  },

  locationInfo: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingRight:
      spacing.sm,
  },

  locationActiveText: {
    flex: 1,
    minWidth: 0,
    fontSize:
      typography.sizes.sm,
    lineHeight:
      typography.lineHeights.sm +
      2,
    color:
      colors.secondary[800],
    fontWeight:
      typography.weights.semibold,
  },

  locationRemoveButton: {
    flexShrink: 0,
  },

  captionInput: {
    minHeight: 120,
    height: 120,
    paddingTop: spacing.md,
    paddingBottom:
      spacing.md,
    textAlignVertical:
      'top',
  },

  submitBtn: {
    marginTop: spacing.md,
    marginBottom:
      spacing.xl,
  },
});
