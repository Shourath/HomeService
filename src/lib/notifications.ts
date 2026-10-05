import prisma from './prisma';

export async function createNotification({
  userId,
  title,
  message,
  type = 'STATUS_UPDATE',
  linkUrl,
}: {
  userId: string;
  title: string;
  message: string;
  type?: string;
  linkUrl?: string;
}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        linkUrl,
      },
    });

    // Sandbox push / SMS logging
    console.log(`[SANDBOX SMS / NOTIFICATION] To User ${userId} [${type}]: ${title} - ${message}`);

    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
}
