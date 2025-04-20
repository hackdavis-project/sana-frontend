import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Base API types
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// TTS types
interface VoiceCloneResponse {
  voice_id: string;
  status: string;
}

// STT types
interface Transcription {
  full_text: string;
  language: string;
}

interface TranscriptionResponse {
  transcription: Transcription;
  status: string;
}

// User types
interface User {
  id: string;
  username: string;
}

interface CurrentUser {
  user_id: string;
  email: string;
  name: string;
  voice_id?: string;
  onboarded?: boolean;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface LoginRequest {
  username: string;
  password: string;
}

interface RegisterRequest {
  username: string;
  password: string;
}

// Journal types
interface JournalEntry {
  entry_id: string;
  title?: string;
  note?: string;
  shared?: boolean;
  classification?: string;
  createdAt?: string;
  feelingRating?: number;
}

interface CreateJournalEntryResponse {
  entry_id: string;
}

interface UpdateJournalEntryRequest {
  entry_id: string;
  note?: string;
  title?: string;
  shared?: boolean;
  classification?: string;
}

interface JournalEntriesResponse {
  entries: JournalEntry[];
}

// Resource types
interface Resource {
  id: string;
  name: string;
  description: string;
  address: string;
  phone?: string;
  website?: string;
  category: string;
}

// Community types
interface SharedEntry {
  id: string;
  content: string;
  category: string;
  createdAt: string;
}

// Feelings tracker types
interface FeelingData {
  entries: {
    date: string;
    rating: number;
  }[];
}

// Mock responses for development/testing
const mockResponses = {
  transcription: (file: File): Promise<ApiResponse<TranscriptionResponse>> => {
    console.log("MOCK: Processing transcription for file:", file.name, "size:", file.size);
    // Return a mock transcription after a delay
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockTexts = [
          "Today was a challenging day. I struggled with feelings of anxiety, but I managed to practice some deep breathing exercises that helped me calm down.",
          "I'm proud of myself for speaking up in the meeting today. It wasn't easy, but I expressed my concerns and felt heard.",
          "I noticed I've been avoiding social gatherings lately. I think I need to be gentle with myself and recognize that healing takes time.",
          "Writing in this journal is helping me process my thoughts and gain clarity about my situation."
        ];

        // Select a random mock text
        const randomText = mockTexts[Math.floor(Math.random() * mockTexts.length)];
        console.log("MOCK: Generated transcription text:", randomText);

        resolve({
          success: true,
          data: {
            transcription: {
              full_text: randomText,
              language: "en"
            },
            status: "completed"
          }
        });
      }, 1500); // Simulate network delay
    });
  }
};

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;
  private useMocks: boolean = process.env.NODE_ENV === 'development';

  constructor(baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://sana-api.miromiro.dev/api') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    // Add request interceptor to include auth token
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    console.log("ApiClient initialized, using mocks:", this.useMocks);
  }

  // Auth methods
  async login(request: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.client.post<ApiResponse<AuthResponse>>('/auth/login', request);
    if (response.data.success && response.data.data.token) {
      this.token = response.data.data.token;
    }
    return response.data;
  }

  async register(request: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.client.post<ApiResponse<AuthResponse>>('/auth/register', request);
    return response.data;
  }

  async logout(): Promise<ApiResponse<null>> {
    this.token = null;
    return { success: true, data: null };
  }

  async getCurrentUser(): Promise<ApiResponse<CurrentUser>> {
    const response = await this.client.get<CurrentUser>('/auth/me');
    return {
      success: true,
      data: response.data
    };
  }

  async updateOnboardedStatus(onboarded: boolean): Promise<ApiResponse<null>> {
    const response = await this.client.patch<ApiResponse<null>>('/auth/onboarded', { onboarded });
    return response.data;
  }


  // Journal methods
  async getJournalEntries(): Promise<ApiResponse<JournalEntry[]>> {
    const response = await this.client.get<JournalEntriesResponse>('/journal/get_entries');
    return {
      success: true,
      data: response.data.entries
    };
  }

  async getJournalEntry(entry_id: string): Promise<ApiResponse<JournalEntry>> {
    // Since there's no specific get-by-id endpoint in the backend, we can implement this client-side
    // by fetching all entries and finding the one with matching ID
    const response = await this.getJournalEntries();
    if (response.success) {
      const entry = response.data.find(entry => entry.entry_id === entry_id);
      if (entry) {
        return { success: true, data: entry };
      }
      return { success: false, message: 'Journal entry not found', data: {} as JournalEntry };
    }
    return {
      success: false,
      message: response.message || 'Failed to fetch journal entries',
      data: {} as JournalEntry
    };
  }

  async createJournalEntry(params?: { content?: string, feelingRating?: number }): Promise<ApiResponse<CreateJournalEntryResponse>> {
    const response = await this.client.get<CreateJournalEntryResponse>('/journal/create_entry');
    return {
      success: true,
      data: response.data
    };
  }

  async updateJournalEntry(request: UpdateJournalEntryRequest): Promise<ApiResponse<JournalEntry>> {
    const response = await this.client.post<JournalEntry>('/journal/update_entry', request);
    return {
      success: true,
      data: response.data
    };
  }

  async deleteJournalEntry(entry_id: string): Promise<ApiResponse<null>> {
    await this.client.delete(`/journal/delete_entry?entry_id=${entry_id}`);
    return {
      success: true,
      data: null
    };
  }

  async toggleJournalEntrySharing(entry_id: string, shared: boolean): Promise<ApiResponse<JournalEntry>> {
    const response = await this.client.post<JournalEntry>('/journal/update_entry', {
      entry_id,
      shared
    });
    return {
      success: true,
      data: response.data
    };
  }

  // Community methods
  async getSharedEntries(category?: string): Promise<ApiResponse<SharedEntry[]>> {
    const url = category ? `/community?category=${category}` : '/community';
    const response = await this.client.get<ApiResponse<SharedEntry[]>>(url);
    return response.data;
  }

  // Resources methods
  async getResources(journalEntry: string): Promise<ApiResponse<Resource[]>> {
    //const response = await this.client.post('/resources/get', { journal_entry: journalEntry });
    // The API returns { resources: Resource[] }

    return {
      success: true,
      data: [
        {
          "name": "Empower Yolo",
          "description": "Provides comprehensive services for victims of domestic violence, sexual assault, stalking, and human trafficking in Yolo County. Offers 24/7 crisis lines, emergency shelter, counseling, legal assistance, resource centers, and more.",
          "phone": "530-661-6336",
          "website": "https://empoweryolo.org/",
          "address": "441 D St, Davis, CA 95616",
          "image_url": "https://img.logo.dev/empoweryolo.org",
          "focus": [
            "Domestic Violence",
            "Sexual Assault",
            "Human Trafficking",
            "Shelter",
            "Counseling",
            "Legal Aid",
            "Crisis",
            "Yolo County"
          ]
        },
        {
          "name": "UC Davis CARE (Center for Advocacy, Resources & Education)",
          "description": "Provides confidential advocacy, support, education, and healing services specifically for UC Davis students, staff, and faculty impacted by sexual harassment, sexual violence, intimate partner violence, and stalking.",
          "phone": "530-752-3299",
          "website": "https://care.ucdavis.edu/",
          "address": "Confidential Location on UC Davis Campus",
          "image_url": "https://img.logo.dev/ucdavis.edu",
          "focus": [
            "Sexual Assault",
            "Domestic Violence",
            "Stalking",
            "Harassment",
            "Advocacy",
            "UC Davis Students"
          ]
        },
        {
          "name": "WEAVE (Sacramento)",
          "description": "Major regional provider of crisis intervention services for survivors of domestic violence, sexual assault, and sex trafficking in Sacramento County.",
          "phone": "916-920-2952 (24/7 Support Line)",
          "website": "https://www.weaveinc.org/",
          "address": "1900 K St, Sacramento, CA 95811",
          "image_url": "https://img.logo.dev/weaveinc.org",
          "focus": [
            "Domestic Violence",
            "Sexual Assault",
            "Sex Trafficking",
            "Crisis",
            "Shelter",
            "Counseling",
            "Sacramento County"
          ]
        }
      ]
    }
    // if (response.data && Array.isArray(response.data.resources)) {
    //   return {
    //     success: true,
    //     data: response.data.resources,
    //   };
    // } else {
    //   return {
    //     success: false,
    //     data: [],
    //     message: 'No resources found or invalid response format.'
    //   };
    // }
  }

  // Feelings tracker methods
  async getFeelingData(): Promise<ApiResponse<FeelingData>> {
    // Mock a week of mood ratings
    const today = new Date();
    const entries = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - i));
      return {
        date: date.toISOString().slice(0, 10),
        rating: Math.floor(Math.random() * 5) + 1 // 1-5 scale
      };
    });
    return {
      success: true,
      data: { entries }
    };
  }

  // TTS methods
  async generateTTS(text: string): Promise<Blob> {
    const response = await this.client.get('/tts/generate', {
      params: { text },
      responseType: 'blob'
    });
    return response.data;
  }

  async cloneVoice(audioFile: File): Promise<ApiResponse<VoiceCloneResponse>> {
    const formData = new FormData();
    formData.append('file', audioFile);

    const response = await this.client.post<VoiceCloneResponse>('/tts/clone_voice', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return {
      success: true,
      data: response.data
    };
  }

  // Speech-to-text methods
  async transcribeAudio(audioFile: File): Promise<ApiResponse<TranscriptionResponse>> {
    console.log("transcribeAudio called with file:", audioFile.name, "size:", audioFile.size);
    try {
      const formData = new FormData();
      formData.append('file', audioFile);

      const response = await this.client.post<TranscriptionResponse>('/spt/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("Error in transcribeAudio:", error);
      return {
        success: false,
        message: "Failed to transcribe audio",
        data: {
          transcription: { full_text: "", language: "en" },
          status: "failed"
        }
      };
    }
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();

// Export types
export type {
  ApiResponse,
  User,
  CurrentUser,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  JournalEntry,
  CreateJournalEntryResponse,
  UpdateJournalEntryRequest,
  Resource,
  SharedEntry,
  FeelingData,
  JournalEntriesResponse,
  VoiceCloneResponse,
  Transcription,
  TranscriptionResponse
}; 