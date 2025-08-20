import type { SyntheticEvent } from "react";
import type { Observer } from "./observer";

interface LogEntry {
    timestamp: Date;
    eventType: string;
    target: string;
    data: EventData;
}

interface EventData {
    type: string;
    timeStamp: number;
    bubbles: boolean;
    cancelable: boolean;
    defaultPrevented: boolean;
    [key: string]: unknown;
}

export class Logger implements Observer<SyntheticEvent> {
    private static instance: Logger;
    private logs: LogEntry[] = [];

    private constructor() {}

    static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    update(event: SyntheticEvent): void {
        const logEntry: LogEntry = {
            timestamp: new Date(),
            eventType: event.type,
            target: this.getTargetInfo(event.target),
            data: this.extractEventData(event)
        };

        this.logs.push(logEntry);
        this.printLog(logEntry);
    }

    private getTargetInfo(target: EventTarget | null): string {
        if (!target) return 'unknown';
        
        const element = target as HTMLElement;
        const tagName = element.tagName?.toLowerCase() || 'unknown';
        const id = element.id ? `#${element.id}` : '';
        const className = element.className ? `.${element.className.split(' ').join('.')}` : '';
        
        return `${tagName}${id}${className}`;
    }

    private extractEventData(event: SyntheticEvent): EventData {
        const { type, timeStamp, bubbles, cancelable, defaultPrevented } = event;
        
        // 이벤트 타입별로 추가 데이터 추출
        const additionalData: Record<string, unknown> = {};
        
        if (event.type === 'click' || event.type === 'mousedown' || event.type === 'mouseup') {
            const mouseEvent = event as React.MouseEvent;
            additionalData.clientX = mouseEvent.clientX;
            additionalData.clientY = mouseEvent.clientY;
            additionalData.button = mouseEvent.button;
        }
        
        if (event.type === 'change' || event.type === 'input') {
            const target = event.target as HTMLInputElement;
            additionalData.value = target.value;
        }
        
        if (event.type.startsWith('key')) {
            const keyEvent = event as React.KeyboardEvent;
            additionalData.key = keyEvent.key;
            additionalData.code = keyEvent.code;
        }

        return {
            type,
            timeStamp,
            bubbles,
            cancelable,
            defaultPrevented,
            ...additionalData
        };
    }

    private printLog(logEntry: LogEntry): void {
        const { timestamp, eventType, target, data } = logEntry;
        const timeStr = timestamp.toLocaleTimeString('ko-KR', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            fractionalSecondDigits: 3 
        });
        
        console.group(`🎯 [${timeStr}] ${eventType.toUpperCase()} Event`);
        console.log(`📍 Target: ${target}`);
        console.log(`📊 Data:`, data);
        console.groupEnd();
    }

    getLogs(): LogEntry[] {
        return [...this.logs];
    }

    clearLogs(): void {
        this.logs = [];
        console.clear();
        console.log('🧹 Logger: All logs cleared');
    }

    getLogsSummary(): Record<string, number> {
        return this.logs.reduce((summary, log) => {
            summary[log.eventType] = (summary[log.eventType] || 0) + 1;
            return summary;
        }, {} as Record<string, number>);
    }
}