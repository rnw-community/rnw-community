import AsyncStorage from '@react-native-community/async-storage';
// @ts-ignore
import webStorage from 'redux-persist/lib/storage';

import { storage as storageMobile } from './storage';
import { storage as storageWeb } from './storage.web';

describe('storage', () => {
    it('should return storage object on MOBILE platform', () => {
        const storage = storageMobile;

        expect(storage).toEqual(AsyncStorage);
    });

    it('should return storage object on WEB platform', () => {
        const storage = storageWeb;

        expect(storage).toEqual(webStorage);
    });
});
