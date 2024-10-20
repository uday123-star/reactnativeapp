import { ScreenHeight, ScreenWidth } from '@freakycoder/react-native-helpers';

let HEADER_HEIGHT = 0;
export class Screens {
  /**
   * 1% of Screen width
   */
  wunit: number = ScreenWidth / 100;
  /**
   * 1% of Screen height
   */
  hunit: number = ScreenHeight / 100;
  /**
   * Screen aspect ratio (height:width)
   */
  aspectratio: number = ScreenHeight / ScreenWidth;
  /**
   * Screen width
   */
  width: number = ScreenWidth;
  /**
   * Screen height
   */
  height: number = ScreenHeight;

  /**
   * Calculates the size of an object based on the ScreenWidth
   * @param ratio Aspect ratio of the object (width:height)
   * @param marginW desired wunit margin, right and left, summing both sides
   * @param marginH desired wunit margin, top and bottom, summing both sides
   * @returns 
   */
  calcSizeW(ratio: number, marginW = 0, marginH = 0) {
    const objMarginW = this.wunit * marginW;
    const objMarginH = this.wunit * marginH;
    const width = ScreenWidth - objMarginW;
    return {
      width,
      height: (width - objMarginH) / ratio,
    }
  }

  /**
   * Calculates the size of an object based on the ScreenHeight
   * @param ratio Aspect ratio of the object (height:width)
   * @param marginW desired hunit margin, right and left, summing both sides
   * @param marginH desired hunit margin, top and bottom, summing both sides
   * @returns 
   */
  calcSizeH(ratio: number, marginW = 0, marginH = 0) {
    const objMarginW = this.hunit * marginW;
    const objMarginH = this.hunit * marginH;
    const height = ScreenHeight - objMarginH;
    return {
      width: (height - objMarginW) / ratio,
      height: height,
    }
  }

  setHeaderHeight(height: number) {
    HEADER_HEIGHT = height;
  }
  /**
   * 
   * @returns the header height in pixels
   */
  getHeaderHeight(): number {
    return HEADER_HEIGHT;
  }

  /**
   * 
   * @returns the footer height in pixels
   */
  getFooterHeight(): number {
    return this.hunit * 11;
  }
}
