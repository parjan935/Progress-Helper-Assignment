import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class ApiService {

    private baseUrl = 'http://localhost:4000/api';

    constructor(private http: HttpClient) { }

    getHelpers(): Observable<any> {
        return this.http.get(`${this.baseUrl}`);
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
        this.http.post(`${this.baseUrl}/download-helpers`, payload, { responseType: 'blob' })
            .subscribe(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'selected-helpers.xlsx';
                a.click();
                window.URL.revokeObjectURL(url);
            })
    }
}
