import { base64Size, isUploadedPhoto } from './image';

describe('image utils', () => {
  it('should tell an uploaded photo from an online address', () => {
    expect(isUploadedPhoto('data:image/jpeg;base64,/9j/4AAQ')).toBe(true);
    expect(isUploadedPhoto('https://exemple.fr/photo.jpg')).toBe(false);
    expect(isUploadedPhoto(null)).toBe(false);
  });

  it('should estimate the weight of a base64 image', () => {
    // 8 caractères base64 = 6 octets
    expect(base64Size('data:image/jpeg;base64,AAAAAAAA')).toBe(6);
  });
});
