import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/src/app/lib/dbConnect';
import User from '@/src/app/models/User';
import { v2 as cloudinary } from 'cloudinary';
import { createErrorResponse } from '@/src/lib/errors';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('profileImage') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadResult = await new Promise<{secure_url: string}>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'profile_images',
          public_id: session.user.id, // Use user ID as public_id to overwrite
          overwrite: true,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    const imageUrl = uploadResult.secure_url;

    // Update user in database
    await dbConnect();
    await User.findOneAndUpdate(
      { email: session.user.email },
      { avatar: imageUrl },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      message: 'Profile image uploaded successfully'
    });

  } catch (error) {
    return createErrorResponse(error, 'Failed to upload profile image');
  }
}

export async function DELETE(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
  
    try {
        await dbConnect();
        const user = await User.findOne({ email: session.user.email });
        if (!user || !user.avatar) {
            return NextResponse.json({ success: true, message: 'No profile image to delete' });
        }

        // Delete from Cloudinary
        await cloudinary.uploader.destroy(`profile_images/${session.user.id}`);

        // Remove from database
        await User.findOneAndUpdate(
            { email: session.user.email },
            { $unset: { avatar: 1 } },
            { new: true }
        );

        return NextResponse.json({ 
            success: true, 
            message: 'Profile image deleted successfully' 
        });

    } catch (error) {
        return createErrorResponse(error, 'Failed to delete profile image');
    }
}
