/**
 * ORI APP — About Ori Company
 * CMS-driven content. Swap values in Supabase content_blocks table — no code change needed.
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import {
  Youtube,
  Instagram,
  Globe,
  MapPin,
  Calendar,
  ExternalLink,
  Play,
  Heart,
  Leaf,
  Shield,
  Sparkles,
  TreePine,
  Users,
} from 'lucide-react-native';

import { Card, PressableCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Divider } from '@/components/ui/Divider';
import { Skeleton } from '@/components/ui/LoadingSpinner';
import { useTheme } from '@/theme';
import { useAllContent, useEvents, getContentValue } from '@/hooks/useContent';
import { LINKS } from '@/utils/constants';
import { formatDate } from '@/utils/formatting';
import { trackScreenView } from '@/lib/analytics';
import { useEffect } from 'react';

const LOGO_MARK = require('../../../assets/brand/ORI Logo-02.png');

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Value Icons ──────────────────────────────────────────────────────────────
const VALUE_ICONS: Record<string, React.FC<any>> = {
  Innovation: Sparkles,
  Integrity:  Shield,
  'Well-being': Heart,
  Sustainability: TreePine,
  Community:  Users,
};

// ─── Video Player Section ─────────────────────────────────────────────────────
function VideoSection({
  title,
  subtitle,
  videoUrl,
  posterUrl,
}: {
  title:     string;
  subtitle?: string;
  videoUrl:  string;
  posterUrl: string;
}) {
  const { colors, fontFamilies, gold } = useTheme();
  const videoHeight = (SCREEN_WIDTH - 40) * 0.5625; // 16:9

  return (
    <View style={{ gap: 12 }}>
      <View style={{ gap: 4 }}>
        <Text style={{ fontFamily: fontFamilies.headingBold, fontSize: 22, color: colors.textPrimary }}>
          {title}
        </Text>
        {subtitle && (
          <Text style={{ fontFamily: fontFamilies.headingItalic, fontSize: 15, color: gold[400] }}>
            {subtitle}
          </Text>
        )}
      </View>

      <TouchableOpacity
        onPress={() => Linking.openURL(videoUrl)}
        activeOpacity={0.9}
        style={{
          width:           SCREEN_WIDTH - 40,
          height:          videoHeight,
          borderRadius:    16,
          overflow:        'hidden',
          backgroundColor: colors.surfaceAlt,
        }}
      >
        <Image
          source={{ uri: posterUrl }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={400}
        />
        <View
          style={{
            position:        'absolute',
            inset:           0,
            alignItems:      'center',
            justifyContent:  'center',
            backgroundColor: 'rgba(0,0,0,0.35)',
          }}
        >
          <View
            style={{
              width:           64,
              height:          64,
              borderRadius:    32,
              backgroundColor: gold[400],
              alignItems:      'center',
              justifyContent:  'center',
            }}
          >
            <Play size={28} color="#ffffff" fill="#ffffff" style={{ marginLeft: 3 }} />
          </View>
          <Text style={{ fontFamily: fontFamilies.bodyMedium, fontSize: 12, color: '#FFFFFF', marginTop: 10, opacity: 0.9 }}>
            Watch on YouTube
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

// ─── Value Card ───────────────────────────────────────────────────────────────
function ValueCard({ title, body }: { title: string; body: string }) {
  const { colors, fontFamilies, gold } = useTheme();
  const Icon = VALUE_ICONS[title] ?? Leaf;

  return (
    <Card style={{ flex: 1, minWidth: 148 }}>
      <View
        style={{
          width:           44,
          height:          44,
          borderRadius:    22,
          backgroundColor: `${gold[400]}22`,
          alignItems:      'center',
          justifyContent:  'center',
          marginBottom:    12,
        }}
      >
        <Icon size={22} color={gold[400]} />
      </View>
      <Text style={{ fontFamily: fontFamilies.headingBold, fontSize: 16, color: colors.textPrimary, marginBottom: 6, lineHeight: 22 }}>
        {title}
      </Text>
      <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 13, color: colors.textSecondary, lineHeight: 19 }}>
        {body}
      </Text>
    </Card>
  );
}

// ─── Event Card ───────────────────────────────────────────────────────────────
function EventCard({ event }: { event: any }) {
  const { colors, fontFamilies, gold } = useTheme();

  return (
    <PressableCard
      onPress={() => event.external_url && Linking.openURL(event.external_url)}
      style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}
    >
      <View
        style={{
          width:           52,
          height:          52,
          borderRadius:    12,
          backgroundColor: `${gold[400]}22`,
          alignItems:      'center',
          justifyContent:  'center',
          flexShrink:      0,
        }}
      >
        <Calendar size={24} color={gold[400]} />
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={{ fontFamily: fontFamilies.bodySemiBold, fontSize: 15, color: colors.textPrimary, lineHeight: 21 }}>
          {event.title}
        </Text>
        <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 13, color: gold[400] }}>
          {formatDate(event.date)} {event.start_time ? `· ${event.start_time.slice(0,5)}` : ''}
        </Text>
        {event.location && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <MapPin size={12} color={colors.textTertiary} />
            <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 12, color: colors.textTertiary }}>
              {event.location}
            </Text>
          </View>
        )}
        {event.description && (
          <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 12, color: colors.textSecondary, lineHeight: 18, marginTop: 2 }} numberOfLines={2}>
            {event.description}
          </Text>
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
          {event.is_free && <Badge label="Free" variant="success" size="sm" />}
          {event.external_url && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <ExternalLink size={11} color={colors.textTertiary} />
              <Text style={{ fontFamily: fontFamilies.bodyMedium, fontSize: 11, color: colors.textTertiary }}>More info</Text>
            </View>
          )}
        </View>
      </View>
    </PressableCard>
  );
}

// ─── Social Button ────────────────────────────────────────────────────────────
function SocialButton({
  icon,
  label,
  url,
  variant = 'primary',
}: {
  icon:    React.ReactNode;
  label:   string;
  url:     string;
  variant?: 'primary' | 'secondary';
}) {
  const { colors, fontFamilies, gold } = useTheme();

  return (
    <TouchableOpacity
      onPress={() => Linking.openURL(url)}
      style={{
        flex:            1,
        flexDirection:   'row',
        alignItems:      'center',
        justifyContent:  'center',
        gap:             8,
        backgroundColor: variant === 'primary' ? gold[400] : colors.surface,
        borderWidth:     1.5,
        borderColor:     variant === 'primary' ? gold[400] : colors.border,
        borderRadius:    14,
        paddingVertical: 14,
      }}
    >
      {icon}
      <Text
        style={{
          fontFamily: fontFamilies.bodySemiBold,
          fontSize:   14,
          color:      '#ffffff',
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function AboutScreen() {
  const { colors, fontFamilies, gold, forest, yellow } = useTheme();
  const { data: content, isLoading: contentLoading } = useAllContent();
  const { data: events, isLoading: eventsLoading }   = useEvents();
  useEffect(() => {
    trackScreenView('About');
  }, []);

  // CMS helpers — with sensible fallbacks
  const c = content ?? {};
  const overview  = c.company_overview  ?? [];
  const compVid   = c.company_video     ?? [];
  const foundVid  = c.founder_video     ?? [];
  const values    = c.values            ?? [];
  const community = c.community         ?? [];
  const socialLinks = c.social_links    ?? [];

  const headline      = getContentValue(overview, 'headline')  || 'Flourish Naturally, Live Better';
  const overviewBody  = getContentValue(overview, 'body')      || 'Ori Company is a vertically integrated medical cannabis company rooted in Washington, DC.';
  const missionText   = getContentValue(overview, 'mission')   || 'Empowering individuals through education, compassion, and the highest-quality medical cannabis products.';
  const communityHead = getContentValue(community, 'headline') || 'Rooted in DC';
  const communityBody = getContentValue(community, 'body')     || 'Ori Company is deeply committed to Washington, DC.';

  const companyVideoUrl  = getContentValue(compVid, 'video_url')  || 'https://youtu.be/JGpWp4QbNUc?si=ijnwAn75NUwP6A43';
  const companyPosterUrl = getContentValue(compVid, 'poster_url') || 'https://placehold.co/800x450/0D1B12/C8922A?text=Our+Story';
  const companyVidTitle  = getContentValue(compVid, 'title')      || 'Our Story';
  const companyVidSub    = getContentValue(compVid, 'subtitle')   || '';

  const founderVideoUrl  = getContentValue(foundVid, 'video_url')  || 'https://youtu.be/hdjk-f7CwR0?si=cZqdF_4hLS1w70Z8';
  const founderPosterUrl = getContentValue(foundVid, 'poster_url') || 'https://placehold.co/800x450/0D1B12/F5F0E8?text=Founder+Video';
  const founderVidTitle  = getContentValue(foundVid, 'title')      || 'From the Founder';
  const founderVidSub    = getContentValue(foundVid, 'subtitle')   || '';

  const youtubeUrl   = getContentValue(socialLinks, 'youtube_url')   || LINKS.youtube;
  const instagramUrl = getContentValue(socialLinks, 'instagram_url') || LINKS.instagram;

  // Build values array from CMS
  const coreValues = [1, 2, 3, 4, 5].map((i) => ({
    title: getContentValue(values, `value_${i}_title`),
    body:  getContentValue(values, `value_${i}_body`),
  })).filter((v) => v.title);

  // Fallback values if CMS is empty
  const displayValues = coreValues.length > 0 ? coreValues : [
    { title: 'Innovation',   body: 'Pioneering cannabis education and access in Washington, DC.' },
    { title: 'Integrity',    body: 'Transparent practices and honest patient care.' },
    { title: 'Well-being',   body: 'Holistic wellness through plant-based medicine.' },
    { title: 'Sustainability', body: 'Environmentally conscious operations.' },
    { title: 'Community',    body: 'Rooted in and giving back to Washington, DC.' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Header ───────────────────────────────────── */}
        <View
          style={{
            padding:         24,
            paddingTop:      32,
            backgroundColor: forest[400],
            gap:             16,
          }}
        >
          {/* Brand logo */}
          <Image
            source={LOGO_MARK}
            style={{ width: 56, height: 56 }}
            contentFit="contain"
          />

          <View style={{ gap: 8 }}>
            <Text style={{ fontFamily: fontFamilies.headingBold, fontSize: 30, color: '#ffffff', letterSpacing: -0.5, lineHeight: 38 }}>
              {headline}
            </Text>
            <View style={{ height: 2, width: 48, backgroundColor: gold[400] }} />
            <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 15, color: '#ffffff', lineHeight: 24 }}>
              {overviewBody}
            </Text>
          </View>

          {/* Mission callout */}
          <View
            style={{
              backgroundColor: `${gold[400]}20`,
              borderLeftWidth: 3,
              borderLeftColor: yellow[200],
              borderRadius:    8,
              padding:         14,
            }}
          >
            <Text style={{ fontFamily: fontFamilies.headingItalic, fontSize: 15, color: '#ffffff', lineHeight: 23 }}>
              "{missionText}"
            </Text>
          </View>
        </View>

        <View style={{ padding: 20, gap: 36 }}>

          {/* ── Company Video ──────────────────────────────── */}
          <VideoSection
            title={companyVidTitle}
            subtitle={companyVidSub}
            videoUrl={companyVideoUrl}
            posterUrl={companyPosterUrl}
          />

          <Divider />

          {/* ── Founder Video ─────────────────────────────── */}
          <VideoSection
            title={founderVidTitle}
            subtitle={founderVidSub}
            videoUrl={founderVideoUrl}
            posterUrl={founderPosterUrl}
          />

          <Divider />

          {/* ── Core Values ───────────────────────────────── */}
          <View style={{ gap: 16 }}>
            <View style={{ gap: 4 }}>
              <Text style={{ fontFamily: fontFamilies.headingBold, fontSize: 22, color: colors.textPrimary }}>
                Our Values
              </Text>
              <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 14, color: colors.textSecondary }}>
                The principles that guide everything we do
              </Text>
            </View>

            {contentLoading ? (
              <View style={{ gap: 12 }}>
                {[0, 1, 2].map((i) => <Skeleton key={i} height={120} borderRadius={16} />)}
              </View>
            ) : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                {displayValues.map((v) => (
                  <View key={v.title} style={{ width: (SCREEN_WIDTH - 52) / 2 }}>
                    <ValueCard title={v.title} body={v.body} />
                  </View>
                ))}
              </View>
            )}
          </View>

          <Divider />

          {/* ── Community ─────────────────────────────────── */}
          <View style={{ gap: 16 }}>
            <Text style={{ fontFamily: fontFamilies.headingBold, fontSize: 22, color: colors.textPrimary }}>
              {communityHead}
            </Text>
            <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 15, color: colors.textSecondary, lineHeight: 26 }}>
              {communityBody}
            </Text>
          </View>

          <Divider />

          {/* ── Upcoming Events ───────────────────────────── */}
          <View style={{ gap: 16 }}>
            <View style={{ gap: 4 }}>
              <Text style={{ fontFamily: fontFamilies.headingBold, fontSize: 22, color: colors.textPrimary }}>
                Upcoming Events
              </Text>
              <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 14, color: colors.textSecondary }}>
                Join us in the community
              </Text>
            </View>

            {eventsLoading ? (
              <View style={{ gap: 12 }}>
                {[0, 1].map((i) => <Skeleton key={i} height={100} borderRadius={16} />)}
              </View>
            ) : events && events.length > 0 ? (
              <View style={{ gap: 12 }}>
                {events.map((event) => <EventCard key={event.id} event={event} />)}
              </View>
            ) : (
              <Card>
                <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 14, color: colors.textSecondary, textAlign: 'center' }}>
                  No upcoming events — check back soon!
                </Text>
              </Card>
            )}
          </View>

          <Divider />

          {/* ── Connect ───────────────────────────────────── */}
          <View style={{ gap: 16 }}>
            <Text style={{ fontFamily: fontFamilies.headingBold, fontSize: 22, color: colors.textPrimary }}>
              Connect With Us
            </Text>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <SocialButton
                icon={<Youtube size={20} color="#ffffff" />}
                label="YouTube"
                url={youtubeUrl}
                variant="primary"
              />
              <SocialButton
                icon={<Instagram size={20} color={colors.textPrimary} />}
                label="Instagram"
                url={instagramUrl}
                variant="secondary"
              />
            </View>

            <TouchableOpacity
              onPress={() => Linking.openURL(LINKS.website)}
              style={{
                flexDirection:   'row',
                alignItems:      'center',
                justifyContent:  'center',
                gap:             8,
                paddingVertical: 12,
              }}
            >
              <Globe size={16} color={colors.textTertiary} />
              <Text style={{ fontFamily: fontFamilies.bodyMedium, fontSize: 14, color: colors.textTertiary }}>
                oricompanydc.com
              </Text>
              <ExternalLink size={12} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>

          {/* ── Legal Footer ──────────────────────────────── */}
          <View
            style={{
              backgroundColor: colors.surfaceAlt,
              borderRadius:    12,
              padding:         14,
              gap:             8,
            }}
          >
            <Text style={{ fontFamily: fontFamilies.bodySemiBold, fontSize: 12, color: colors.textTertiary }}>
              LEGAL
            </Text>
            <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 11, color: colors.textTertiary, lineHeight: 17 }}>
              Ori Company is a licensed medical cannabis company operating under Washington, DC regulations. For adults 21+ and registered medical patients only. Cannabis products are for personal medical use. Not for resale. Keep all products away from children and pets.
            </Text>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
