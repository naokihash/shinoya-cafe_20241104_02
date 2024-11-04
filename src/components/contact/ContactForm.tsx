import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import useWeb3Forms from '@web3forms/react';
import { FormData, FormError } from './types';

const COOLDOWN_PERIOD = 60; // seconds
const ACCESS_KEY = '7b3f31cc-4449-41f1-a35e-a9952020eb59';

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [cooldown, setCooldown] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [formError, setFormError] = useState<FormError | null>(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const { submit, isSubmitting, isSuccess } = useWeb3Forms({
    access_key: ACCESS_KEY,
    settings: {
      from_name: 'しのやカフェ お問い合わせフォーム',
      subject: 'しのやカフェ 新規お問い合わせ',
      to: 'naoki.hashimoto@krym.jp',
      message: `
新しいお問い合わせが届きました。

■お名前
{{name}}

■メールアドレス
{{email}}

■電話番号
{{phone}}

■メッセージ
{{message}}
      `
    }
  });

  useEffect(() => {
    if (cooldown && cooldownTime > 0) {
      const timer = setInterval(() => {
        setCooldownTime((prev) => {
          if (prev <= 1) {
            setCooldown(false);
            setIsButtonDisabled(false);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [cooldown, cooldownTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cooldown) {
      setFormError({ message: `送信は${cooldownTime}秒後に可能になります` });
      return;
    }

    setIsButtonDisabled(true);

    try {
      await submit({
        ...formData,
        access_key: ACCESS_KEY,
      });

      setCooldown(true);
      setCooldownTime(COOLDOWN_PERIOD);
      setFormError(null);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      setFormError({
        message: '送信に失敗しました。時間をおいて再度お試しください。'
      });
      setIsButtonDisabled(false);
    }
  };

  const resetForm = () => {
    if (!cooldown) {
      setFormData({ name: '', email: '', phone: '', message: '' });
      setFormError(null);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-4">
          お問い合わせありがとうございます
        </h3>
        <p className="text-gray-600 mb-6">
          内容を確認次第、担当者よりご連絡させていただきます。
          しばらくお待ちくださいませ。
        </p>
        {cooldown && (
          <p className="text-sm text-gray-500 mb-4">
            新しいお問い合わせは{cooldownTime}秒後に可能になります
          </p>
        )}
        <button
          onClick={resetForm}
          disabled={cooldown}
          className="bg-green-800 text-white px-6 py-3 rounded-full hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          新しいお問い合わせをする
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-2xl font-semibold text-gray-900 mb-6">お問い合わせフォーム</h3>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          お名前<span className="text-red-500 ml-1">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          メールアドレス<span className="text-red-500 ml-1">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          電話番号<span className="text-red-500 ml-1">*</span>
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          required
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="例: 090-1234-5678"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
          メッセージ<span className="text-red-500 ml-1">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          value={formData.message}
          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || cooldown || isButtonDisabled}
        className={`w-full bg-green-800 text-white px-6 py-3 rounded-full transition ${
          isSubmitting || cooldown || isButtonDisabled
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-green-700'
        }`}
      >
        {isSubmitting ? '送信中...' : cooldown ? `再送信まで${cooldownTime}秒` : '送信する'}
      </button>

      {formError && (
        <div className="flex items-center space-x-2 text-red-600 justify-center">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">{formError.message}</p>
        </div>
      )}
    </form>
  );
}