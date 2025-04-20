// Custom event system for voice note transcriptions
type EventCallback = (data: any) => void;
type EventType = 'CREATE_VOICE_NOTE' | 'VOICE_NOTE_CREATED';

interface EventSubscription {
  eventType: EventType;
  callback: EventCallback;
  id: number;
}

class VoiceEventSystem {
  private static instance: VoiceEventSystem;
  private subscriptions: EventSubscription[] = [];
  private nextSubscriptionId = 1;

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  public static getInstance(): VoiceEventSystem {
    if (!VoiceEventSystem.instance) {
      VoiceEventSystem.instance = new VoiceEventSystem();
    }
    return VoiceEventSystem.instance;
  }

  /**
   * Subscribe to an event
   * @param eventType The event type to subscribe to
   * @param callback Function to call when event occurs
   * @returns Subscription ID for unsubscribing
   */
  public subscribe(eventType: EventType, callback: EventCallback): number {
    const id = this.nextSubscriptionId++;
    this.subscriptions.push({
      eventType,
      callback,
      id
    });
    console.log(`Subscribed to ${eventType} with ID ${id}`);
    return id;
  }

  /**
   * Unsubscribe from an event
   * @param subscriptionId The subscription ID to unsubscribe
   */
  public unsubscribe(subscriptionId: number): void {
    const index = this.subscriptions.findIndex(sub => sub.id === subscriptionId);
    if (index !== -1) {
      this.subscriptions.splice(index, 1);
      console.log(`Unsubscribed from ID ${subscriptionId}`);
    }
  }

  /**
   * Publish an event
   * @param eventType The event type to publish
   * @param data Data to pass to subscribers
   */
  public publish(eventType: EventType, data: any): void {
    console.log(`Publishing event ${eventType}`, data);
    this.subscriptions
      .filter(sub => sub.eventType === eventType)
      .forEach(sub => {
        try {
          sub.callback(data);
        } catch (error) {
          console.error(`Error in event handler for ${eventType}:`, error);
        }
      });
  }
}

// Export singleton instance
export const voiceEvents = VoiceEventSystem.getInstance();

// Export types
export type { EventType, EventCallback }; 