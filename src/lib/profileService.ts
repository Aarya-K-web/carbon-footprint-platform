import { supabase } from './supabaseClient';

export interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string;
  sustainability_goal: 'low-carbon' | 'carbon-neutral' | 'zero-waste' | 'eco-guardian';
  target_carbon_reduction: number;
  sustainability_score: number;
  onboarding_completed: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetch a user profile by ID.
 * If no profile exists (e.g., legacy users created before the trigger), 
 * creates one dynamically as a safeguard.
 */
export const fetchProfile = async (userId: string): Promise<{ data: UserProfile | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      // Legacy user safeguard: Create profile record on the fly
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        const fallbackProfile: UserProfile = {
          id: userId,
          full_name: userData.user.user_metadata?.full_name || '',
          avatar_url: userData.user.user_metadata?.avatar_url || '',
          sustainability_goal: 'low-carbon',
          target_carbon_reduction: 15,
          sustainability_score: 0,
          onboarding_completed: false,
        };

        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([fallbackProfile])
          .select()
          .single();

        if (insertError) throw insertError;
        return { data: newProfile, error: null };
      }
    }

    return { data, error: null };
  } catch (err: any) {
    console.error('Error fetching profile:', err);
    return { data: null, error: err };
  }
};

/**
 * Update user profile parameters.
 */
export const updateProfile = async (
  userId: string,
  updates: Partial<Omit<UserProfile, 'id' | 'sustainability_score' | 'created_at' | 'updated_at'>>
): Promise<{ data: UserProfile | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    console.error('Error updating profile:', err);
    return { data: null, error: err };
  }
};

/**
 * Uploads an avatar image into the avatars storage bucket.
 * Organizes files into folders by user ID and overrides or adds timestamps to bypass CDN caching.
 */
export const uploadAvatar = async (
  userId: string,
  file: File
): Promise<{ publicUrl: string | null; error: any }> => {
  try {
    // 1. Enforce size and file type validation limits
    if (file.size > 2 * 1024 * 1024) {
      throw new Error('File size exceeds the 2MB limit.');
    }

    if (!file.type.startsWith('image/')) {
      throw new Error('Only image files (JPEG, PNG, SVG) are permitted.');
    }

    // 2. Build unique filename path to bypass caching
    const fileExt = file.name.split('.').pop() || 'png';
    const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`;

    // 3. Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // 4. Retrieve Public URL from storage CDN
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    if (!data?.publicUrl) {
      throw new Error('Failed to retrieve public URL for uploaded avatar.');
    }

    // 5. Update the profiles table with the new URL
    const { error: profileUpdateError } = await updateProfile(userId, {
      avatar_url: data.publicUrl,
    });

    if (profileUpdateError) throw profileUpdateError;

    return { publicUrl: data.publicUrl, error: null };
  } catch (err: any) {
    console.error('Error uploading avatar:', err);
    return { publicUrl: null, error: err };
  }
};
