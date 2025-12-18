// WebSocket placeholder for real-time updates

type MessageHandler = (data: unknown) => void;

class MockWebSocket {
  private handlers: Map<string, MessageHandler[]> = new Map();
  private intervalId: number | null = null;

  connect() {
    console.log('[WS] Connecting to mock WebSocket...');
    
    // Simulate real-time updates
    this.intervalId = window.setInterval(() => {
      this.emit('prizePool', {
        type: 'prizePool',
        value: 125000 + Math.random() * 10000,
      });

      this.emit('matchState', {
        type: 'matchState',
        pot: 45000 + Math.random() * 5000,
        stage: ['preflop', 'flop', 'turn', 'river'][Math.floor(Math.random() * 4)],
      });
    }, 3000);

    return Promise.resolve();
  }

  disconnect() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('[WS] Disconnected from mock WebSocket');
  }

  on(event: string, handler: MessageHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);
  }

  off(event: string, handler: MessageHandler) {
    const handlers = this.handlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: unknown) {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }
}

export const ws = new MockWebSocket();

// Connect on module load
if (typeof window !== 'undefined') {
  ws.connect();
}
