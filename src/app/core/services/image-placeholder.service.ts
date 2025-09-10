import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImagePlaceholderService {

  /**
   * Generate a placeholder image URL based on product brand
   * @param brand Product brand name
   * @param productName Product name
   * @returns Placeholder image URL
   */
  generatePlaceholderImage(brand: string, productName: string): string {
    // Create a simple placeholder using a service like placeholder.com or similar
    const encodedBrand = encodeURIComponent(brand);
    const encodedProduct = encodeURIComponent(productName);
    
    // Using placeholder.com with custom text
    return `https://via.placeholder.com/300x200/f3f4f6/6b7280?text=${encodedBrand}`;
  }

  /**
   * Generate a colored placeholder based on brand
   * @param brand Product brand name
   * @returns Placeholder image URL with brand color
   */
  generateBrandPlaceholder(brand: string): string | null {
    // Return null to use CSS placeholder instead
    return null;
  }

  /**
   * Get brand color for CSS placeholder
   * @param brand Product brand name
   * @returns CSS color value
   */
  getBrandColor(brand: string): string {
    const colors = [
      '#3b82f6', // blue
      '#10b981', // emerald
      '#f59e0b', // amber
      '#ef4444', // red
      '#8b5cf6', // violet
      '#06b6d4', // cyan
      '#84cc16', // lime
      '#f97316'  // orange
    ];
    
    // Generate consistent color based on brand name
    const hash = this.hashCode(brand);
    const colorIndex = Math.abs(hash) % colors.length;
    return colors[colorIndex];
  }

  /**
   * Simple hash function for consistent color generation
   * @param str Input string
   * @returns Hash code
   */
  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }
}
