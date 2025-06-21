import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DateHandlerService {
  constructor() {}

  convertFromDateISO(date: Date) {
    if (!date) return undefined;
    let dateCopy = new Date(date.valueOf());
    dateCopy.setHours(0, 0, 0, 0);
    return dateCopy.toISOString();
  }

  convertToDateISO(date: Date) {
    if (!date) return undefined;
    let dateCopy = new Date(date.valueOf());
    dateCopy.setHours(23, 59, 59, 999);
    return dateCopy.toISOString();
  }
}
