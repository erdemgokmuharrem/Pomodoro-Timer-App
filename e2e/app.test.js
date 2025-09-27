const { device, expect, element, by, waitFor } = require('detox');

describe('Pomodoro+ App E2E Tests', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Dashboard Screen', () => {
    it('should display dashboard elements', async () => {
      await expect(element(by.text('Pomodoro+'))).toBeVisible();
      await expect(element(by.text('Bugünün Görevleri'))).toBeVisible();
      await expect(element(by.text('Başla'))).toBeVisible();
    });

    it('should navigate to timer screen', async () => {
      await element(by.text('Başla')).tap();
      await expect(element(by.text('Pomodoro Timer'))).toBeVisible();
    });

    it('should display gamification features', async () => {
      await expect(element(by.text('Seviye'))).toBeVisible();
      await expect(element(by.text('XP'))).toBeVisible();
    });
  });

  describe('Timer Screen', () => {
    beforeEach(async () => {
      await element(by.text('Başla')).tap();
    });

    it('should start pomodoro timer', async () => {
      await expect(element(by.text('Başla'))).toBeVisible();
      await element(by.text('Başla')).tap();

      // Wait for timer to start
      await waitFor(element(by.text('Duraklat')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should pause and resume timer', async () => {
      await element(by.text('Başla')).tap();
      await waitFor(element(by.text('Duraklat')))
        .toBeVisible()
        .withTimeout(5000);

      await element(by.text('Duraklat')).tap();
      await expect(element(by.text('Devam Et'))).toBeVisible();

      await element(by.text('Devam Et')).tap();
      await expect(element(by.text('Duraklat'))).toBeVisible();
    });

    it('should stop timer', async () => {
      await element(by.text('Başla')).tap();
      await waitFor(element(by.text('Duraklat')))
        .toBeVisible()
        .withTimeout(5000);

      await element(by.text('Duraklat')).tap();
      await element(by.text('Durdur')).tap();
      await expect(element(by.text('Başla'))).toBeVisible();
    });
  });

  describe('Tasks Screen', () => {
    beforeEach(async () => {
      await element(by.text('Görevler')).tap();
    });

    it('should display tasks screen', async () => {
      await expect(element(by.text('Görevlerim'))).toBeVisible();
      await expect(element(by.text('+ Yeni Görev'))).toBeVisible();
    });

    it('should add new task', async () => {
      await element(by.text('+ Yeni Görev')).tap();
      await expect(element(by.text('Görev Ekle'))).toBeVisible();

      await element(by.id('task-title-input')).typeText('Test Görevi');
      await element(by.id('task-description-input')).typeText(
        'Test açıklaması'
      );
      await element(by.text('Kaydet')).tap();

      await expect(element(by.text('Test Görevi'))).toBeVisible();
    });

    it('should edit task', async () => {
      // First add a task
      await element(by.text('+ Yeni Görev')).tap();
      await element(by.id('task-title-input')).typeText('Düzenlenecek Görev');
      await element(by.text('Kaydet')).tap();

      // Then edit it
      await element(by.text('Düzenlenecek Görev')).tap();
      await element(by.id('task-title-input')).clearText();
      await element(by.id('task-title-input')).typeText('Düzenlenmiş Görev');
      await element(by.text('Güncelle')).tap();

      await expect(element(by.text('Düzenlenmiş Görev'))).toBeVisible();
    });

    it('should delete task', async () => {
      // First add a task
      await element(by.text('+ Yeni Görev')).tap();
      await element(by.id('task-title-input')).typeText('Silinecek Görev');
      await element(by.text('Kaydet')).tap();

      // Then delete it
      await element(by.text('Silinecek Görev')).longPress();
      await element(by.text('Sil')).tap();

      await expect(element(by.text('Silinecek Görev'))).not.toBeVisible();
    });
  });

  describe('Settings Screen', () => {
    beforeEach(async () => {
      await element(by.text('Ayarlar')).tap();
    });

    it('should display settings screen', async () => {
      await expect(element(by.text('Ayarlar'))).toBeVisible();
      await expect(element(by.text('Pomodoro Süreleri'))).toBeVisible();
      await expect(element(by.text('Ses Ayarları'))).toBeVisible();
    });

    it('should change pomodoro duration', async () => {
      await element(by.text('Pomodoro Süreleri')).tap();
      await expect(element(by.text('Pomodoro Süresi'))).toBeVisible();

      // Change pomodoro duration
      await element(by.id('pomodoro-duration-slider')).adjustSliderToPosition(
        0.3
      );
      await element(by.text('Kaydet')).tap();
    });

    it('should toggle sound settings', async () => {
      await element(by.text('Ses Ayarları')).tap();
      await expect(element(by.text('Ses Efektleri'))).toBeVisible();

      await element(by.id('sound-effects-toggle')).tap();
      await element(by.id('background-sounds-toggle')).tap();
    });
  });

  describe('Gamification Features', () => {
    it('should display XP and level', async () => {
      await expect(element(by.text('Seviye'))).toBeVisible();
      await expect(element(by.text('XP'))).toBeVisible();
    });

    it('should show badges', async () => {
      await element(by.text('Rozetler')).tap();
      await expect(element(by.text('Kazanılan Rozetler'))).toBeVisible();
    });

    it('should display achievements', async () => {
      await element(by.text('Başarılar')).tap();
      await expect(element(by.text('Başarılarım'))).toBeVisible();
    });
  });

  describe('Advanced Features', () => {
    it('should access energy recommendations', async () => {
      await element(by.text('Enerji Önerileri')).tap();
      await expect(element(by.text('Enerji Analizi'))).toBeVisible();
    });

    it('should access weekly review', async () => {
      await element(by.text('Haftalık Review')).tap();
      await expect(element(by.text('Haftalık Analiz'))).toBeVisible();
    });

    it('should access group pomodoros', async () => {
      await element(by.text('Grup Pomodoroları')).tap();
      await expect(element(by.text('Grup Seansları'))).toBeVisible();
    });

    it('should access focus rooms', async () => {
      await element(by.text('Focus Rooms')).tap();
      await expect(element(by.text('Sanal Odalar'))).toBeVisible();
    });

    it('should access league system', async () => {
      await element(by.text('Lig Sistemi')).tap();
      await expect(element(by.text('Haftalık Lig'))).toBeVisible();
    });

    it('should access social challenges', async () => {
      await element(by.text('Social Challenges')).tap();
      await expect(element(by.text('Sosyal Yarışmalar'))).toBeVisible();
    });

    it('should access smart duration', async () => {
      await element(by.text('Akıllı Süre Önerileri')).tap();
      await expect(element(by.text('Süre Önerileri'))).toBeVisible();
    });

    it('should access task scheduling', async () => {
      await element(by.text('Görev Zamanlama')).tap();
      await expect(element(by.text('Zamanlama Önerileri'))).toBeVisible();
    });

    it('should access adaptive mode', async () => {
      await element(by.text('Adaptif Mod')).tap();
      await expect(element(by.text('Adaptif Ayarlar'))).toBeVisible();
    });

    it('should access AI coach', async () => {
      await element(by.text('AI Koç')).tap();
      await expect(element(by.text('AI Koçluk'))).toBeVisible();
    });

    it('should access smart scheduling', async () => {
      await element(by.text('Akıllı Zamanlama')).tap();
      await expect(element(by.text('Akıllı Planlama'))).toBeVisible();
    });

    it('should access quests', async () => {
      await element(by.text('Görevler & Maceralar')).tap();
      await expect(element(by.text('Görevler'))).toBeVisible();
    });

    it('should access artistic collections', async () => {
      await element(by.text('Sanatsal Koleksiyonlar')).tap();
      await expect(element(by.text('Sanat Galerisi'))).toBeVisible();
    });

    it('should access virtual garden', async () => {
      await element(by.text('Sanal Bahçe')).tap();
      await expect(element(by.text('Sanal Bahçe'))).toBeVisible();
    });

    it('should access avatar customization', async () => {
      await element(by.text('Avatar Düzenle')).tap();
      await expect(element(by.text('Avatar Kişiselleştirme'))).toBeVisible();
    });
  });

  describe('Navigation', () => {
    it('should navigate between tabs', async () => {
      await element(by.text('Görevler')).tap();
      await expect(element(by.text('Görevlerim'))).toBeVisible();

      await element(by.text('Timer')).tap();
      await expect(element(by.text('Pomodoro Timer'))).toBeVisible();

      await element(by.text('İstatistikler')).tap();
      await expect(element(by.text('İstatistikler'))).toBeVisible();

      await element(by.text('Ayarlar')).tap();
      await expect(element(by.text('Ayarlar'))).toBeVisible();
    });
  });

  describe('Offline Functionality', () => {
    it('should work offline', async () => {
      await device.setURLBlacklist(['.*']);

      await element(by.text('Başla')).tap();
      await expect(element(by.text('Pomodoro Timer'))).toBeVisible();

      await device.clearURLBlacklist();
    });
  });

  describe('Accessibility', () => {
    it('should support screen readers', async () => {
      await expect(element(by.text('Pomodoro+'))).toBeVisible();
      // Test accessibility labels
      await expect(element(by.label('Ana ekran'))).toBeVisible();
    });
  });
});
