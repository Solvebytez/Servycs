import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, FONT_SIZE, MARGIN, PADDING } from '../../../constants';
import { ResponsiveText, GlobalStatusBar } from '@/components';

export default function SearchScreen() {
  const [searchText, setSearchText] = useState('');

  // Mock data for search results
  const searchResults = [
    {
      id: '1',
      name: 'Glowberry Studio',
      rating: '4.8★',
      address: 'DLF Phase 4, Gurgaon, Haryana - 122002',
      price: '₹799',
      services: 'Facial, Hair Spa....',
      closingTime: '8:00 pm',
      image: require('../../../assets/user.png')
    },
    {
      id: '2',
      name: 'Serenity Spa & Wellness',
      rating: '4.7★',
      address: 'DLF Phase 4, Gurgaon, Haryana - 122002',
      price: '₹999',
      services: 'Serene Oasis, Waxing....',
      closingTime: '8:30 pm',
      image: require('../../../assets/user-laptop.png')
    }
  ];

  const handleCloseSearch = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <GlobalStatusBar />
      <View style={styles.container}>
        {/* Top Navigation Bar */}
        <View style={styles.searchHeader}>
          <TouchableOpacity style={styles.backButton} onPress={handleCloseSearch}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={COLORS.text.light} style={styles.searchIcon} />
            <TextInput
              placeholder="Search for service"
              placeholderTextColor={COLORS.text.light}
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
              autoFocus
            />
          </View>
          
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="filter" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Promotional Banner */}
        <View style={styles.promotionalBanner}>
          <LinearGradient
            colors={[COLORS.primary[200], COLORS.primary[100]]}
            style={styles.bannerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.bannerContent}>
              <View style={styles.bannerLeft}>
                <ResponsiveText variant="h3" weight="bold" color={COLORS.white} style={styles.bannerTitle}>
                  Listro
                </ResponsiveText>
                <ResponsiveText variant="h4" weight="bold" color={COLORS.white} style={styles.bannerSubtitle}>
                  Summer Sale!
                </ResponsiveText>
                <ResponsiveText variant="body2" color={COLORS.white} style={styles.bannerDescription}>
                  Up to 20% off Spa treatments
                </ResponsiveText>
              </View>
              <TouchableOpacity style={styles.shopNowButton}>
                <ResponsiveText variant="buttonSmall" weight="bold" color={COLORS.primary[200]}>
                  Shop Now
                </ResponsiveText>
                <Ionicons name="arrow-forward" size={16} color={COLORS.primary[200]} />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Search Results */}
        <View style={styles.searchResultsContainer}>
          <ResponsiveText variant="h5" weight="bold" color={COLORS.text.primary} style={styles.resultsCount}>
            4.2k results for your search
          </ResponsiveText>
          
          <ScrollView style={styles.searchResultsList} showsVerticalScrollIndicator={false}>
            {searchResults.map((result) => (
              <View key={result.id} style={styles.searchResultCard}>
                <Image source={result.image} style={styles.resultImage} />
                <View style={styles.resultDetails}>
                  <View style={styles.resultHeader}>
                    <ResponsiveText variant="h5" weight="bold" color={COLORS.text.primary}>
                      {result.name}
                    </ResponsiveText>
                    <View style={styles.ratingTag}>
                      <ResponsiveText variant="caption1" weight="bold" color={COLORS.white}>
                        {result.rating}
                      </ResponsiveText>
                    </View>
                  </View>
                  
                  <ResponsiveText variant="body3" color={COLORS.text.secondary} style={styles.resultAddress}>
                    {result.address}
                  </ResponsiveText>
                  
                  <ResponsiveText variant="body2" weight="medium" color={COLORS.text.primary} style={styles.resultPrice}>
                    Starting at: {result.price}
                  </ResponsiveText>
                  
                  <ResponsiveText variant="body3" color={COLORS.text.secondary} style={styles.resultServices}>
                    Popular Services: {result.services}
                  </ResponsiveText>
                  
                  <ResponsiveText variant="body3" color={COLORS.text.secondary} style={styles.resultTime}>
                    Open until {result.closingTime}
                  </ResponsiveText>
                  
                  <View style={styles.resultButtons}>
                    <TouchableOpacity style={styles.bookButton}>
                      <ResponsiveText variant="buttonSmall" weight="bold" color={COLORS.white}>
                        Book Now
                      </ResponsiveText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.enquiryButton}>
                      <ResponsiveText variant="buttonSmall" weight="bold" color={COLORS.primary[200]}>
                        Enquiry Now
                      </ResponsiveText>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
            
            {/* View More Button */}
            <View style={styles.viewMoreContainer}>
              <TouchableOpacity style={styles.viewMoreButton}>
                <ResponsiveText variant="body2" weight="medium" color={COLORS.text.secondary}>
                  View more
                </ResponsiveText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: PADDING.screen,
    paddingTop: MARGIN.md,
    paddingBottom: MARGIN.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingHorizontal: PADDING.md,
    paddingVertical: PADDING.xs,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 50,
    marginHorizontal: MARGIN.md,
  },
  searchIcon: {
    marginRight: MARGIN.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZE.body2,
    color: COLORS.primary[200],
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  promotionalBanner: {
    paddingHorizontal: PADDING.screen,
    marginTop: MARGIN.md,
    marginBottom: MARGIN.md,
  },
  bannerGradient: {
    borderRadius: 12,
    padding: PADDING.md,
    alignItems: 'center',
  },
  bannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerLeft: {
    flex: 1,
  },
  bannerTitle: {
    marginBottom: MARGIN.xs,
  },
  bannerSubtitle: {
    marginBottom: MARGIN.xs,
  },
  bannerDescription: {
    lineHeight: 20,
  },
  shopNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: PADDING.xs,
    paddingHorizontal: PADDING.md,
    marginTop: MARGIN.md,
  },
  searchResultsContainer: {
    paddingHorizontal: PADDING.screen,
    paddingBottom: MARGIN.xl,
  },
  resultsCount: {
    marginBottom: MARGIN.md,
  },
  searchResultsList: {
    //
  },
  searchResultCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: MARGIN.md,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  resultDetails: {
    flex: 1,
    padding: PADDING.md,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: MARGIN.xs,
  },
  ratingTag: {
    backgroundColor: COLORS.primary[200],
    borderRadius: 8,
    paddingHorizontal: PADDING.xs,
    paddingVertical: PADDING.xs,
  },
  resultAddress: {
    marginBottom: MARGIN.xs,
  },
  resultPrice: {
    marginBottom: MARGIN.xs,
  },
  resultServices: {
    marginBottom: MARGIN.xs,
  },
  resultTime: {
    marginBottom: MARGIN.md,
  },
  resultButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: MARGIN.md,
  },
  bookButton: {
    flex: 1,
    backgroundColor: COLORS.primary[200],
    borderRadius: 12,
    paddingVertical: PADDING.xs,
    paddingHorizontal: PADDING.md,
    alignItems: 'center',
    marginRight: MARGIN.sm,
  },
  enquiryButton: {
    flex: 1,
    backgroundColor: COLORS.primary[100],
    borderRadius: 12,
    paddingVertical: PADDING.xs,
    paddingHorizontal: PADDING.md,
    alignItems: 'center',
  },
  viewMoreContainer: {
    alignItems: 'center',
    marginTop: MARGIN.md,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MARGIN.xs,
  },
});
