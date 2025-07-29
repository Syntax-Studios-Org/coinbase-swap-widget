import { OnrampQuoteParams, OnrampUrlParams, SessionTokenRequest, SessionTokenResponse } from "@/types/onramp";
import type { Address } from "viem";


export class OnrampService {
  private static readonly COINBASE_PAY_BASE_URL = 'https://pay.coinbase.com/buy/select-asset';
  private static readonly BASE_MAINNET = 'base';
  private static readonly USDC_ASSET = 'USDC';
  private static readonly DEFAULT_FIAT_CURRENCY = 'USD';

  /**
   * Generates a session token for secure onramp initialization
   */
  static async generateSessionToken(
    address: Address,
    networks: string[] = [OnrampService.BASE_MAINNET],
    assets?: string[]
  ): Promise<string | null> {
    try {
      const requestBody: SessionTokenRequest = {
        addresses: [
          {
            address,
            blockchains: networks,
          },
        ],
        ...(assets && { assets }),
      };

      const response = await fetch('/api/onramp/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Session token generation failed:', error);
        throw new Error(error.error || 'Failed to generate session token');
      }

      const data: SessionTokenResponse = await response.json();
      return data.token;
    } catch (error) {
      console.error('Error generating session token:', error);
      return null;
    }
  }

  /**
   * Helper function to format addresses for session token request
   */
  static formatAddressesForToken(
    address: string,
    networks: string[]
  ): Array<{ address: string; blockchains: string[] }> {
    return [
      {
        address,
        blockchains: networks,
      },
    ];
  }

  /**
   * Generates a one-click-buy onramp URL with session token
   */
  static generateOnrampUrl(params: OnrampUrlParams): string {
    const {
      sessionToken,
      fiatAmount,
      fiatCurrency,
      defaultAsset,
      defaultNetwork,
      defaultPaymentMethod = 'CARD',
      destinationAddress,
      partnerUserId,
      redirectUrl,
    } = params;

    // Build query parameters
    // Note: When using sessionToken, we don't include addresses in URL
    // as they're already included in the session token
    const queryParams = new URLSearchParams({
      sessionToken,
      defaultAsset,
      fiatCurrency,
      presetFiatAmount: fiatAmount.toString(),
      defaultPaymentMethod,
      defaultNetwork,
      partnerUserId: partnerUserId || destinationAddress, // Use provided partnerUserId or fallback to wallet address
    });

    // Add optional parameters
    if (redirectUrl) {
      queryParams.set('redirectUrl', redirectUrl);
    }

    return `${OnrampService.COINBASE_PAY_BASE_URL}?${queryParams.toString()}`;
  }

  /**
   * Generates a USDC onramp URL for Base mainnet
   */
  static async generateUSDCOnrampUrl(
    destinationAddress: Address,
    fiatAmount: number,
    fiatCurrency: string = OnrampService.DEFAULT_FIAT_CURRENCY
  ): Promise<string | null> {
    try {
      // Generate session token for Base mainnet with USDC
      const sessionToken = await OnrampService.generateSessionToken(
        destinationAddress,
        [OnrampService.BASE_MAINNET],
        [OnrampService.USDC_ASSET]
      );

      if (!sessionToken) {
        throw new Error('Failed to generate session token');
      }

      // Generate the onramp URL
      const onrampUrl = OnrampService.generateOnrampUrl({
        sessionToken,
        fiatAmount,
        fiatCurrency,
        defaultAsset: OnrampService.USDC_ASSET,
        defaultNetwork: OnrampService.BASE_MAINNET,
        destinationAddress,
      });

      return onrampUrl;
    } catch (error) {
      console.error('Error generating USDC onramp URL:', error);
      return null;
    }
  }

  /**
   * Opens the onramp URL in a new window/tab
   */
  static openOnrampWindow(url: string): Window | null {
    try {
      const onrampWindow = window.open(
        url,
        'coinbase-onramp',
        'width=500,height=700,scrollbars=yes,resizable=yes'
      );

      if (!onrampWindow) {
        console.warn('Failed to open onramp window - popup might be blocked');
        // Fallback to same window navigation
        window.location.href = url;
        return null;
      }

      return onrampWindow;
    } catch (error) {
      console.error('Error opening onramp window:', error);
      // Fallback to same window navigation
      window.location.href = url;
      return null;
    }
  }

  /**
   * Validates onramp parameters before generating URL
   */
  static validateOnrampParams(params: OnrampQuoteParams): boolean {
    const { fiatAmount, fiatCurrency, cryptoAsset, network, destinationAddress } = params;

    if (!destinationAddress || destinationAddress.length !== 42) {
      console.error('Invalid destination address');
      return false;
    }

    if (fiatAmount <= 0) {
      console.error('Fiat amount must be greater than 0');
      return false;
    }

    if (!fiatCurrency || fiatCurrency.length !== 3) {
      console.error('Invalid fiat currency code');
      return false;
    }

    if (!cryptoAsset) {
      console.error('Crypto asset is required');
      return false;
    }

    if (!network) {
      console.error('Network is required');
      return false;
    }

    return true;
  }
}
