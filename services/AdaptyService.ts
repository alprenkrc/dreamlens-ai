import { adapty, AdaptyPaywall, AdaptyProfile } from 'react-native-adapty';

export const activationPromise = (async () => {
    try {
      const apiKey = process.env.EXPO_PUBLIC_ADAPTY_API_KEY;
      if (!apiKey) {
        throw new Error("EXPO_PUBLIC_ADAPTY_API_KEY is not defined");
      }
      await adapty.activate(apiKey);
    } catch (error) {
      console.error("Adapty activation failed:", error);
    }
  })();

// export class AdaptyService {
//   // Paywall'ları getir
//   static async getPaywalls(): Promise<AdaptyPaywall[]> {
//     try {
//       const paywalls = await adapty.getPaywalls();
//       return paywalls;
//     } catch (error) {
//       console.error("Failed to get paywalls:", error);
//       return [];
//     }
//   }

//   // Belirli bir paywall'ı getir
//   static async getPaywall(placementId: string): Promise<AdaptyPaywall | null> {
//     try {
//       const paywall = await adapty.getPaywall(placementId);
//       return paywall;
//     } catch (error) {
//       console.error("Failed to get paywall:", error);
//       return null;
//     }
//   }

//   // Ürünleri getir
//   static async getProducts(): Promise<AdaptyProduct[]> {
//     try {
//       const products = await adapty.getProducts();
//       return products;
//     } catch (error) {
//       console.error("Failed to get products:", error);
//       return [];
//     }
//   }

//   // Satın alma işlemi
//   static async makePurchase(product: AdaptyProduct): Promise<boolean> {
//     try {
//       const result = await adapty.makePurchase(product);
//       return result;
//     } catch (error) {
//       console.error("Purchase failed:", error);
//       return false;
//     }
//   }

//   // Profil bilgilerini getir
//   static async getProfile(): Promise<AdaptyProfile | null> {
//     try {
//       const profile = await adapty.getProfile();
//       return profile;
//     } catch (error) {
//       console.error("Failed to get profile:", error);
//       return null;
//     }
//   }

//   // Abonelik durumunu kontrol et
//   static async isSubscribed(): Promise<boolean> {
//     try {
//       const profile = await this.getProfile();
//       return profile?.accessLevels?.premium?.isActive || false;
//     } catch (error) {
//       console.error("Failed to check subscription status:", error);
//       return false;
//     }
//   }

//   // Restore purchases
//   static async restorePurchases(): Promise<boolean> {
//     try {
//       const result = await adapty.restorePurchases();
//       return result;
//     } catch (error) {
//       console.error("Restore purchases failed:", error);
//       return false;
//     }
//   }
// }