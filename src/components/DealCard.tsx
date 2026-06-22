import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Deal } from '../types';
import { colors, spacing, radius, typography } from '../theme';
import { formatPrice, formatSavings } from '../services/api';
import { StarIcon, TagIcon } from './Icons';

interface DealCardProps {
  deal: Deal;
  onPress: () => void;
}

function MetaScore({ score }: { score: string }) {
  const num = parseInt(score, 10);
  if (!num) return null;

  const scoreColor =
    num >= 75 ? colors.metaGreen : num >= 50 ? colors.metaYellow : colors.metaRed;

  return (
    <View style={[styles.metaBadge, { borderColor: scoreColor }]}>
      <Text style={[styles.metaText, { color: scoreColor }]}>{num}</Text>
    </View>
  );
}

export function DealCard({ deal, onPress }: DealCardProps) {
  const savings = Math.round(parseFloat(deal.savings));
  const salePrice = parseFloat(deal.salePrice);
  const isFree = salePrice === 0;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.thumbContainer}>
        <Image
          source={{ uri: deal.thumb }}
          style={styles.thumb}
          resizeMode="cover"
        />
        <View style={styles.savingsBadge}>
          <TagIcon size={10} color={colors.bg0} />
          <Text style={styles.savingsText}>{savings}%</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {deal.title}
        </Text>

        <View style={styles.priceRow}>
          <Text style={[styles.salePrice, isFree && styles.freePrice]}>
            {isFree ? 'Free' : formatPrice(deal.salePrice)}
          </Text>
          {!isFree && (
            <Text style={styles.normalPrice}>{formatPrice(deal.normalPrice)}</Text>
          )}
        </View>

        <View style={styles.bottomRow}>
          {deal.metacriticScore !== '0' && (
            <MetaScore score={deal.metacriticScore} />
          )}

          {deal.steamRatingPercent !== '0' && (
            <View style={styles.steamRating}>
              <StarIcon size={11} color={colors.textSecondary} />
              <Text style={styles.steamText}>{deal.steamRatingPercent}%</Text>
            </View>
          )}

          <View style={styles.dealRating}>
            <Text style={styles.dealRatingLabel}>Deal</Text>
            <Text style={styles.dealRatingValue}>{parseFloat(deal.dealRating).toFixed(1)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg2,
    borderRadius: radius.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumbContainer: {
    position: 'relative',
  },
  thumb: {
    width: 110,
    height: 80,
  },
  savingsBadge: {
    position: 'absolute',
    bottom: spacing.xs,
    left: spacing.xs,
    backgroundColor: colors.green,
    borderRadius: radius.sm,
    paddingHorizontal: 5,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  savingsText: {
    color: colors.bg0,
    fontSize: typography.xs,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    justifyContent: 'space-between',
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sm,
    fontWeight: '600',
    lineHeight: typography.sm * typography.tight,
    marginBottom: spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  salePrice: {
    color: colors.accent,
    fontSize: typography.md,
    fontWeight: '700',
  },
  freePrice: {
    color: colors.green,
  },
  normalPrice: {
    color: colors.textMuted,
    fontSize: typography.xs,
    textDecorationLine: 'line-through',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  metaBadge: {
    borderWidth: 1.5,
    borderRadius: radius.sm,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  metaText: {
    fontSize: typography.xs,
    fontWeight: '700',
  },
  steamRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  steamText: {
    color: colors.textSecondary,
    fontSize: typography.xs,
  },
  dealRating: {
    marginLeft: 'auto',
    alignItems: 'flex-end',
  },
  dealRatingLabel: {
    color: colors.textMuted,
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dealRatingValue: {
    color: colors.accent,
    fontSize: typography.xs,
    fontWeight: '700',
  },
});
