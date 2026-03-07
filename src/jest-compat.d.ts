import type {
  Mock as VitestMock,
  Mocked as VitestMocked,
  MockInstance as VitestMockInstance,
  VitestUtils,
} from 'vitest';

export {};

declare global {
  var jest: VitestUtils;

  namespace jest {
    type Mock<T extends (...args: any[]) => any = (...args: any[]) => any> = VitestMock<T>;
    type Mocked<T> = VitestMocked<T>;
    type SpyInstance<T extends (...args: any[]) => any = (...args: any[]) => any> =
      VitestMockInstance<T>;
  }
}
