'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Shield } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield /> Privacy Policy
          </CardTitle>
          <CardDescription>Last updated: July 26, 2024</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none dark:prose-invert">
          <p>
            Welcome to Vaani AI. We are committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, disclose, and
            safeguard your information when you use our application.
          </p>

          <h2>Information We Collect</h2>
          <p>
            We may collect information about you in a variety of ways. The
            information we may collect includes:
          </p>
          <ul>
            <li>
              <strong>Personal Data:</strong> Personally identifiable
              information, such as your name, email address, and demographic
              information (like your spoken languages, nationality, etc.) that
              you voluntarily give to us when you register or update your
              profile.
            </li>
            <li>
              <strong>Translation Data:</strong> All text and voice data you
              provide for translation, including source text, translated text,
              and any cultural context. This also includes voice memos and
              feedback on translations.
            </li>
            <li>
              <strong>Derivative Data:</strong> Information our servers
              automatically collect when you access the app, such as your IP
              address, your browser type, your operating system, your access
              times, and the pages you have viewed directly before and after
              accessing the app. (Note: This is a standard practice for web
              services).
            </li>
          </ul>

          <h2>Use of Your Information</h2>
          <p>
            Having accurate information about you permits us to provide you with
            a smooth, efficient, and customized experience. Specifically, we may
            use information collected about you to:
          </p>
          <ul>
            <li>Create and manage your account.</li>
            <li>
              Provide and improve the AI translation services, including training
              our models on anonymized data to enhance accuracy and cultural
              awareness.
            </li>
            <li>Email you regarding your account or order.</li>
            <li>
              Fulfill and manage purchases, orders, payments, and other
              transactions related to the application.
            </li>
            <li>
              Monitor and analyze usage and trends to improve your experience
              with the application.
            </li>
          </ul>

          <h2>Disclosure of Your Information</h2>
          <p>
            We do not share your personal information with third parties except
            as described in this Privacy Policy. We may share information we have
            collected about you in certain situations:
          </p>
          <ul>
            <li>
              <strong>By Law or to Protect Rights:</strong> If we believe the
              release of information about you is necessary to respond to legal
              process, to investigate or remedy potential violations of our
              policies, or to protect the rights, property, and safety of
              others, we may share your information as permitted or required by
              any applicable law, rule, or regulation.
            </li>
            <li>
              <strong>Third-Party Service Providers:</strong> We may share your
              information with third parties that perform services for us or on
              our behalf, including payment processing, data analysis, email
              delivery, hosting services, and customer service.
            </li>
            <li>
              <strong>AI Model Providers:</strong> Anonymized and aggregated
              translation data may be used to train the underlying generative AI
              models to improve their quality. No personally identifiable
              information is used for this purpose.
            </li>
          </ul>

          <h2>Security of Your Information</h2>
          <p>
            We use administrative, technical, and physical security measures to
            help protect your personal information. While we have taken
            reasonable steps to secure the personal information you provide to
            us, please be aware that despite our efforts, no security measures
            are perfect or impenetrable, and no method of data transmission can
            be guaranteed against any interception or other type of misuse.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have questions or comments about this Privacy Policy, please
            contact us at: [Your Contact Email/Support Link]
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
