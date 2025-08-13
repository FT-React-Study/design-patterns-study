import type { SyntheticEvent } from "react";

interface Observer<T> {
    update(data: T): void;
}

abstract class Observable<T> {
    protected observers: Observer<T>[] = [];
    abstract subscribe(observer: Observer<T>): void;
    abstract unsubscribe(observer: Observer<T>): void;
    abstract notify(data: T): void;
}

class ObservableEvent<T extends SyntheticEvent> extends Observable<T> {
    subscribe(observer: Observer<T>): void {
        this.observers.push(observer);
    }

    unsubscribe(observer: Observer<T>): void {
        this.observers = this.observers.filter(obs => obs !== observer);
    }

    notify(data: T): void {
        this.observers.forEach(observer => observer.update(data));
    }
}

class EventObserver<T extends SyntheticEvent> implements Observer<T> {
    private callback: (data: T) => void;

    constructor(callback: (data: T) => void) {
        this.callback = callback;
    }

    update(data: T): void {
        this.callback(data);
    }
}

export { ObservableEvent, EventObserver };
export type { Observer, Observable };