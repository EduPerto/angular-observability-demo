import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

export interface Order {
    id: number;
    userId: number;
    items: string[];
    totalAmount: number;
    createdAt: string;
    status: string;
}

export interface OrderRequest {
    userId: number;
    productIds: number[];
}

export interface HealthCheck {
    status: string;
    timestamp: string;
}

@Injectable({
    providedIn: 'root'
})
export class BackendApiService {
    private readonly baseUrl = environment.backendApiUrl;

    constructor(private http: HttpClient) { }

    /**
     * Health check - verifica se a API está online
     */
    healthCheck(): Observable<HealthCheck> {
        return this.http.get<HealthCheck>(`${this.baseUrl}/api/health`);
    }

    /**
     * Lista todos os usuários
     */
    getUsers(): Observable<User[]> {
        return this.http.get<User[]>(`${this.baseUrl}/api/users`);
    }

    /**
     * Busca usuário por ID
     */
    getUserById(id: number): Observable<User> {
        return this.http.get<User>(`${this.baseUrl}/api/users/${id}`);
    }

    /**
     * Cria um novo pedido
     */
    createOrder(order: OrderRequest): Observable<Order> {
        return this.http.post<Order>(`${this.baseUrl}/api/orders`, order);
    }

    /**
     * Lista todos os pedidos
     */
    getOrders(): Observable<Order[]> {
        return this.http.get<Order[]>(`${this.baseUrl}/api/orders`);
    }

    /**
     * Executa operação lenta (para testes de trace)
     */
    slowOperation(delayMs: number): Observable<{ message: string; timestamp: string }> {
        return this.http.get<{ message: string; timestamp: string }>(
            `${this.baseUrl}/api/slow-operation/${delayMs}`
        );
    }

    /**
     * Executa chamada externa (para testes de trace distribuído)
     */
    externalCall(): Observable<{ message: string; data: string }> {
        return this.http.get<{ message: string; data: string }>(
            `${this.baseUrl}/api/external-call`
        );
    }

    // ============================================
    // ERROR SIMULATION METHODS
    // ============================================

    /**
     * Simula erro 400 Bad Request
     */
    simulateBadRequest(): Observable<any> {
        return this.http.get(`${this.baseUrl}/api/error/bad-request`);
    }

    /**
     * Simula erro 404 Not Found
     */
    simulateNotFound(): Observable<any> {
        return this.http.get(`${this.baseUrl}/api/error/not-found`);
    }

    /**
     * Simula erro 500 Internal Server Error
     */
    simulateInternalError(): Observable<any> {
        return this.http.get(`${this.baseUrl}/api/error/internal`);
    }

    /**
     * Simula exception não tratada (capturada pelo OpenTelemetry)
     */
    simulateException(): Observable<any> {
        return this.http.get(`${this.baseUrl}/api/error/exception`);
    }

    /**
     * Simula erro de banco de dados
     */
    simulateDatabaseError(): Observable<any> {
        return this.http.get(`${this.baseUrl}/api/error/database`);
    }

    /**
     * Simula erro em cascata (serviço chama outro serviço que falha)
     */
    simulateCascadeError(): Observable<any> {
        return this.http.get(`${this.baseUrl}/api/error/cascade`);
    }

    // ============================================
    // OBSERVABILITY TEST METHODS
    // ============================================

    /**
     * Testa logs em diferentes níveis
     */
    testLogs(): Observable<any> {
        return this.http.get(`${this.baseUrl}/api/test/logs`);
    }

    /**
     * Testa traces aninhados
     */
    testNestedTraces(): Observable<any> {
        return this.http.get(`${this.baseUrl}/api/test/traces/nested`);
    }

    /**
     * Testa latência variável
     */
    testLatency(scenario: 'fast' | 'normal' | 'slow' | 'very-slow'): Observable<any> {
        return this.http.get(`${this.baseUrl}/api/test/latency/${scenario}`);
    }

    /**
     * Testa processamento em batch
     */
    testBatch(items: string[]): Observable<any> {
        return this.http.post(`${this.baseUrl}/api/test/batch`, { items });
    }

    /**
     * Gera métricas de teste
     */
    testMetrics(iterations: number): Observable<any> {
        return this.http.post(`${this.baseUrl}/api/test/metrics`, { iterations });
    }

    /**
     * Testa fluxo completo de usuário
     */
    testCompleteFlow(): Observable<any> {
        return this.http.get(`${this.baseUrl}/api/test/complete-flow`);
    }
}

