// app/settings/page.tsx
import { getServerSession } from "@/lib/server-auth";
import { prisma } from "@/lib/db";
import SettingsClient from "@/app/components/setting";

export default async function SettingsPage() {
  const { user } = await getServerSession();
  if (!user) return null;

  const providers = await prisma.account.findMany({
    where: { userId: user.id },
    select: { provider: true },
  });

  return (
    <SettingsClient
      user={{
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        image: user.image,
      }}
      providers={providers.map((p) => p.provider)}
    />
  );
}
