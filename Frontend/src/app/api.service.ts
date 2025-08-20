import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class ApiService {

    private baseUrl = 'http://localhost:4000/api';

    constructor(private http: HttpClient) { }

    getHelpers(filter: any): Observable<any> {
        // return this.http.get(`${this.baseUrl}`);
        return this.http.post(`${this.baseUrl}/getHelpers`, filter);
    }

    getHelperByID(id: string): Observable<any> {
        return this.http.get(`${this.baseUrl}/${id}`)
    }

    getHelpersByFilter(payload: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/getByFilter`, payload)
    }

    createHelper(payload: FormData): Observable<any> {
        return this.http.post(`${this.baseUrl}`, payload);
    }

    deleteHelper(id: string): Observable<any> {
        return this.http.delete(`${this.baseUrl}/${id}`)
    }

    updateHelper(payload: FormData, id: string): Observable<any> {
        return this.http.put(`${this.baseUrl}/${id}`, payload)
    }

    downloadHelpers(payload: any[]): void {
        payload.forEach(helper => {
            helper.kycDocx = helper.kycDocx?.fileName || '-';
            helper.additionalDocx = helper.additionalDocx?.fileName || '-';
            delete helper.profilePic
            delete helper.employeeId_QR
            delete helper._id
            delete helper.__v
        })
        this.http.post(`${this.baseUrl}/download-helpers`, payload, { responseType: 'blob' })
            .subscribe(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'filtered-helpers-list.xlsx';
                a.click();
                window.URL.revokeObjectURL(url);
            })
    }
}
