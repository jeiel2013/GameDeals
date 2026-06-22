import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, Linking,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { DealDetail } from '../types';
import { fetchDealDetail, formatPrice, formatDate, formatSavings, getStoreLogoUrl } from '../services/api';
import { saveDeal, removeSavedDeal, isDealSaved } from '../services/database';
import { colors, spacing, radius, typography } from '../theme';
import { ArrowLeftIcon, BookmarkIcon, StarIcon, ExternalLinkIcon, TagIcon } from '../components/Icons';

type RouteParams = RouteProp<RootStackParamList, 'DealDetail'>;

export default function DealDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteParams>();
  const { dealID, title } = route.params;

  const [deal, setDeal] = useState<DealDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadDeal(); checkSaved(); }, []);

  const loadDeal = async () => {
    try { setLoading(true); const d = await fetchDealDetail(dealID); setDeal(d); }
    catch { setError('Não foi possível carregar os detalhes.'); }
    finally { setLoading(false); }
  };

  const checkSaved = async () => { setIsSaved(await isDealSaved(dealID)); };

  const handleSave = async () => {
    if (!deal || saving) return;
    setSaving(true);
    try {
      if (isSaved) {
        await removeSavedDeal(dealID);
        setIsSaved(false);
        Alert.alert('Removido', `"${title}" foi removido dos seus deals salvos.`);
      } else {
        await saveDeal({
          dealID,
          title,
          salePrice: deal.gameInfo?.salePrice ?? deal.salePrice ?? '0',
          normalPrice: deal.gameInfo?.retailPrice ?? deal.normalPrice ?? '0',
          savings: deal.savings ?? '0',
          thumb: deal.gameInfo?.thumb ?? deal.thumb ?? '',
        });
        setIsSaved(true);
        Alert.alert('Salvo', `"${title}" foi salvo na sua biblioteca.`);
      }
    } catch { Alert.alert('Erro', 'Algo deu errado. Tente novamente.'); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={colors.accent} />
      <Text style={styles.loadingText}>Carregando deal...</Text>
    </View>
  );

  if (error || !deal) return (
    <View style={styles.centered}>
      <Text style={styles.errorText}>{error ?? 'Deal não encontrado.'}</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={loadDeal}>
        <Text style={styles.retryText}>Tentar novamente</Text>
      </TouchableOpacity>
    </View>
  );

  const gi = deal.gameInfo;
  const salePrice = gi?.salePrice ?? deal.salePrice;
  const retailPrice = gi?.retailPrice ?? deal.normalPrice;
  const savings = deal.savings ?? '0';
  const thumb = gi?.thumb ?? deal.thumb;
  const metacritic = gi?.metacriticScore ?? deal.metacriticScore ?? '0';
  const steamPct = gi?.steamRatingPercent ?? deal.steamRatingPercent ?? '0';
  const steamText = gi?.steamRatingText ?? deal.steamRatingText ?? '';
  const isFree = parseFloat(salePrice) === 0;
  const savingsNum = Math.round(parseFloat(savings));
  const metaNum = parseInt(metacritic, 10);
  const steamNum = parseInt(steamPct, 10);
  const metaColor = metaNum >= 75 ? colors.metaGreen : metaNum >= 50 ? colors.metaYellow : colors.metaRed;
  const steamColor = steamNum >= 80 ? colors.metaGreen : steamNum >= 60 ? colors.metaYellow : colors.metaRed;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeftIcon size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>{title}</Text>
        <TouchableOpacity style={[styles.saveBtn, isSaved && styles.saveBtnActive]} onPress={handleSave} disabled={saving}>
          {saving
            ? <ActivityIndicator size="small" color={isSaved ? colors.bg0 : colors.accent} />
            : <BookmarkIcon size={18} color={isSaved ? colors.bg0 : colors.accent} filled={isSaved} />
          }
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: thumb }} style={styles.hero} resizeMode="cover" />

        <View style={styles.priceSection}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.salePrice, isFree && { color: colors.green }]}>
              {isFree ? 'Grátis' : formatPrice(salePrice)}
            </Text>
            {!isFree && (
              <View style={styles.priceMeta}>
                <Text style={styles.retailPrice}>{formatPrice(retailPrice)}</Text>
                <View style={styles.savingsPill}>
                  <TagIcon size={10} color={colors.bg0} />
                  <Text style={styles.savingsPillText}>{savingsNum}% off</Text>
                </View>
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.ctaBtn} onPress={() => Linking.openURL(`https://www.cheapshark.com/redirect?dealID=${dealID}`)}>
            <ExternalLinkIcon size={16} color={colors.bg0} />
            <Text style={styles.ctaText}>Ver Deal</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {(metaNum > 0 || steamNum > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Avaliações</Text>
            <View style={styles.ratingsRow}>
              {metaNum > 0 && (
                <View style={[styles.metaBadge, { borderColor: metaColor }]}>
                  <Text style={[styles.metaValue, { color: metaColor }]}>{metaNum}</Text>
                  <Text style={[styles.metaLabel, { color: metaColor }]}>Metacritic</Text>
                </View>
              )}
              {steamNum > 0 && (
                <View style={styles.steamBox}>
                  <StarIcon size={16} color={steamColor} filled />
                  <Text style={[styles.steamValue, { color: steamColor }]}>{steamPct}%</Text>
                  {steamText ? <Text style={styles.steamText}>{steamText}</Text> : null}
                </View>
              )}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações</Text>
          {[
            { label: 'Preço com desconto', value: isFree ? 'Grátis' : formatPrice(salePrice), color: isFree ? colors.green : colors.accent },
            { label: 'Preço original', value: formatPrice(retailPrice) },
            { label: 'Economia', value: formatSavings(savings), color: colors.green },
            deal.releaseDate ? { label: 'Lançamento', value: formatDate(deal.releaseDate) } : null,
          ].filter(Boolean).map((row: any, i) => (
            <View key={i} style={styles.infoRow}>
              <Text style={styles.infoLabel}>{row.label}</Text>
              <Text style={[styles.infoValue, row.color ? { color: row.color } : null]}>{row.value}</Text>
            </View>
          ))}
        </View>

        {deal.cheapestPrice && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Menor preço histórico</Text>
            <View style={styles.cheapestCard}>
              <View>
                <Text style={styles.cheapestPrice}>{formatPrice(deal.cheapestPrice.price)}</Text>
                <Text style={styles.cheapestDate}>em {formatDate(deal.cheapestPrice.date)}</Text>
              </View>
              {parseFloat(salePrice) <= parseFloat(deal.cheapestPrice.price) && (
                <View style={styles.allTimeBadge}>
                  <Text style={styles.allTimeText}>Menor de todos os tempos</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {deal.cheaperStores && deal.cheaperStores.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Disponível em outras lojas</Text>
            {deal.cheaperStores.slice(0, 5).map((s, i) => (
              <View key={i} style={styles.storeRow}>
                <Image source={{ uri: getStoreLogoUrl(s.storeID) }} style={styles.storeIcon} resizeMode="contain" />
                <Text style={styles.storePrice}>{formatPrice(s.salePrice)}</Text>
                <Text style={styles.storeRetail}>{formatPrice(s.retailPrice)}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.saveSection}>
          <TouchableOpacity style={[styles.saveLargeBtn, isSaved && styles.saveLargeBtnSaved]} onPress={handleSave} disabled={saving}>
            {saving
              ? <ActivityIndicator size="small" color={isSaved ? colors.textSecondary : colors.bg0} />
              : <BookmarkIcon size={18} color={isSaved ? colors.textSecondary : colors.bg0} filled={isSaved} />
            }
            <Text style={[styles.saveLargeText, isSaved && styles.saveLargeTextSaved]}>
              {isSaved ? 'Salvo na Biblioteca' : 'Salvar na Biblioteca'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.saveHint}>
            {isSaved ? 'Toque para remover dos deals salvos' : 'Armazene este deal localmente no seu dispositivo'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg1 },
  centered: { flex: 1, backgroundColor: colors.bg1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  loadingText: { color: colors.textSecondary, fontSize: typography.sm },
  errorText: { color: colors.textSecondary, fontSize: typography.sm, textAlign: 'center', paddingHorizontal: 32 },
  retryBtn: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, backgroundColor: colors.accent, borderRadius: radius.md },
  retryText: { color: colors.bg0, fontWeight: '700' },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: 52, paddingBottom: spacing.md, backgroundColor: colors.bg0, borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.md },
  backBtn: { padding: spacing.sm, borderRadius: radius.md, backgroundColor: colors.bg3 },
  topBarTitle: { flex: 1, color: colors.textPrimary, fontSize: typography.base, fontWeight: '600' },
  saveBtn: { padding: spacing.sm, borderRadius: radius.md, backgroundColor: colors.bg3, borderWidth: 1, borderColor: colors.accentDim, width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  saveBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  hero: { width: '100%', height: 200, backgroundColor: colors.bg2 },
  priceSection: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.lg, backgroundColor: colors.bg0, gap: spacing.lg },
  salePrice: { color: colors.accent, fontSize: typography.xxl, fontWeight: '800' },
  priceMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 2 },
  retailPrice: { color: colors.textMuted, fontSize: typography.sm, textDecorationLine: 'line-through' },
  savingsPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.green, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full, gap: 3 },
  savingsPillText: { color: colors.bg0, fontSize: typography.xs, fontWeight: '700' },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.accent, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: radius.md },
  ctaText: { color: colors.bg0, fontWeight: '700', fontSize: typography.sm },
  divider: { height: spacing.sm, backgroundColor: colors.bg0 },
  section: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: spacing.sm },
  sectionTitle: { color: colors.textSecondary, fontSize: typography.xs, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.md },
  ratingsRow: { flexDirection: 'row', gap: spacing.lg, alignItems: 'center' },
  metaBadge: { borderWidth: 2, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', minWidth: 72 },
  metaValue: { fontSize: typography.xxl, fontWeight: '800' },
  metaLabel: { fontSize: typography.xs, fontWeight: '600', marginTop: 2 },
  steamBox: { alignItems: 'center', gap: spacing.xs },
  steamValue: { fontSize: typography.xl, fontWeight: '800' },
  steamText: { color: colors.textSecondary, fontSize: typography.xs, textAlign: 'center', maxWidth: 80 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel: { color: colors.textSecondary, fontSize: typography.sm },
  infoValue: { color: colors.textPrimary, fontSize: typography.sm, fontWeight: '600' },
  cheapestCard: { backgroundColor: colors.bg2, borderRadius: radius.md, padding: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  cheapestPrice: { color: colors.textPrimary, fontSize: typography.xl, fontWeight: '700' },
  cheapestDate: { color: colors.textMuted, fontSize: typography.xs, marginTop: 2 },
  allTimeBadge: { backgroundColor: colors.green, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.full },
  allTimeText: { color: colors.bg0, fontSize: typography.xs, fontWeight: '700' },
  storeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.md },
  storeIcon: { width: 24, height: 24, borderRadius: radius.sm, backgroundColor: colors.bg3 },
  storePrice: { color: colors.textPrimary, fontSize: typography.sm, fontWeight: '600', flex: 1 },
  storeRetail: { color: colors.textMuted, fontSize: typography.xs, textDecorationLine: 'line-through' },
  saveSection: { paddingHorizontal: spacing.lg, paddingVertical: spacing.xxl, alignItems: 'center', gap: spacing.md },
  saveLargeBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.accent, paddingVertical: spacing.lg, paddingHorizontal: spacing.xxl, borderRadius: radius.lg, width: '100%', justifyContent: 'center' },
  saveLargeBtnSaved: { backgroundColor: colors.bg3, borderWidth: 1, borderColor: colors.borderStrong },
  saveLargeText: { color: colors.bg0, fontSize: typography.base, fontWeight: '700' },
  saveLargeTextSaved: { color: colors.textSecondary },
  saveHint: { color: colors.textMuted, fontSize: typography.xs, textAlign: 'center' },
});
