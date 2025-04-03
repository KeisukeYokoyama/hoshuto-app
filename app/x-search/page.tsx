'use client';

import { useState, ChangeEvent } from 'react';
import { FaCalendar, FaCopy } from 'react-icons/fa';
import { FaSquareXTwitter } from "react-icons/fa6";

// GA4のイベント送信用の型定義
declare global {
  interface Window {
    gtag: (
      command: 'event',
      action: string,
      params: {
        event_category?: string;
        event_label?: string;
        value?: number;
        [key: string]: any;
      }
    ) => void;
  }
}

// GA4イベント送信用のヘルパー関数
const sendGAEvent = (
  action: string,
  params: {
    event_category?: string;
    event_label?: string;
    value?: number;
    [key: string]: any;
  }
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, params);
  }
};

interface SearchFormData {
  // キーワード
  allKeywords: string;
  exactPhrase: string;
  anyKeywords: string;
  excludeKeywords: string;
  hashtags: string;
  
  // アカウント
  fromAccount: string;
  toAccount: string;
  mentionAccount: string;
  
  // フィルター
  hasReplies: {
    enabled: boolean;
    type: 'include' | 'exclusive';
  };
  hasLinks: {
    enabled: boolean;
    type: 'include' | 'exclusive';
  };
  
  // エンゲージメント
  minReplies: string;
  minLikes: string;
  minRetweets: string;
  
  // 日付
  startYear: string;
  startMonth: string;
  startDay: string;
  endYear: string;
  endMonth: string;
  endDay: string;
}

export default function XSearch() {
  const [formData, setFormData] = useState<SearchFormData>({
    // キーワード
    allKeywords: '',
    exactPhrase: '',
    anyKeywords: '',
    excludeKeywords: '',
    hashtags: '',
    
    // アカウント
    fromAccount: '',
    toAccount: '',
    mentionAccount: '',
    
    // フィルター
    hasReplies: {
      enabled: true,
      type: 'include'
    },
    hasLinks: {
      enabled: true,
      type: 'include'
    },
    
    // エンゲージメント
    minReplies: '',
    minLikes: '',
    minRetweets: '',
    
    // 日付
    startYear: '',
    startMonth: '',
    startDay: '',
    endYear: '',
    endMonth: '',
    endDay: ''
  });
  const [generatedCommand, setGeneratedCommand] = useState('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const generateSearchCommand = () => {
    let command = '';

    if (formData.exactPhrase) {
      command += `"${formData.exactPhrase}" `;
    }

    if (formData.allKeywords) {
      const keywords = formData.allKeywords.split(' ');
      command += keywords.join(' AND ') + ' ';
    }

    if (formData.anyKeywords) {
      const keywords = formData.anyKeywords.split(' ');
      command += keywords.join(' OR ') + ' ';
    }

    if (formData.excludeKeywords) {
      const excludeWords = formData.excludeKeywords.split(' ');
      command += excludeWords.map(word => `-${word}`).join(' ') + ' ';
    }

    if (formData.hashtags) {
      const tags = formData.hashtags.split(' ');
      command += tags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ') + ' ';
    }

    if (formData.fromAccount) {
      command += `(from:${formData.fromAccount.replace('@', '')}) `;
    }

    if (formData.toAccount) {
      command += `(to:${formData.toAccount.replace('@', '')}) `;
    }

    if (formData.mentionAccount) {
      const mention = formData.mentionAccount.startsWith('@') ? formData.mentionAccount : `@${formData.mentionAccount}`;
      command += `(${mention}) `;
    }

    // 返信フィルター
    if (!formData.hasReplies.enabled) {
      command += '-filter:replies ';
    } else if (formData.hasReplies.type === 'exclusive') {
      command += 'filter:replies ';
    }

    // リンクフィルター
    if (!formData.hasLinks.enabled) {
      command += '-filter:links ';
    } else if (formData.hasLinks.type === 'exclusive') {
      command += 'filter:links ';
    }

    if (formData.minLikes) {
      command += `min_faves:${formData.minLikes} `;
    }
    if (formData.minRetweets) {
      command += `min_retweets:${formData.minRetweets} `;
    }
    if (formData.minReplies) {
      command += `min_replies:${formData.minReplies} `;
    }

    if (formData.startYear && formData.startMonth && formData.startDay) {
      command += `since:${formData.startYear}-${formData.startMonth}-${formData.startDay} `;
    }
    if (formData.endYear && formData.endMonth && formData.endDay) {
      command += `until:${formData.endYear}-${formData.endMonth}-${formData.endDay} `;
    }

    setGeneratedCommand(command.trim());
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCommand);
      // コピーボタンクリック時のイベント送信
      sendGAEvent('click_copy_command', {
        event_category: 'engagement',
        event_label: generatedCommand
      });
      alert('コピーしました！');
    } catch (err) {
      alert('コピーに失敗しました。');
    }
  };

  const generateSearchUrl = () => {
    let query = '';

    // キーワード関連の処理
    if (formData.allKeywords) {
      const keywords = formData.allKeywords.split(' ');
      query += keywords.join(' AND ');
    }

    if (formData.exactPhrase) {
      query += query ? ' ' : '';
      query += `"${formData.exactPhrase}"`;
    }

    if (formData.anyKeywords) {
      query += query ? ' ' : '';
      const keywords = formData.anyKeywords.split(' ');
      query += `(${keywords.join(' OR ')})`;
    }

    if (formData.excludeKeywords) {
      query += query ? ' ' : '';
      const excludeWords = formData.excludeKeywords.split(' ');
      query += excludeWords.map(word => `-${word}`).join(' ');
    }

    if (formData.hashtags) {
      query += query ? ' ' : '';
      const tags = formData.hashtags.split(' ');
      query += tags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ');
    }

    // アカウント関連
    if (formData.fromAccount) {
      query += query ? ' ' : '';
      query += `(from:${formData.fromAccount.replace('@', '')})`;
    }

    if (formData.toAccount) {
      query += query ? ' ' : '';
      query += `(to:${formData.toAccount.replace('@', '')})`;
    }

    if (formData.mentionAccount) {
      query += query ? ' ' : '';
      const mention = formData.mentionAccount.startsWith('@') ? formData.mentionAccount : `@${formData.mentionAccount}`;
      query += `(${mention})`;
    }

    // フィルター
    if (!formData.hasReplies.enabled) {
      query += query ? ' ' : '';
      query += '-filter:replies';
    } else if (formData.hasReplies.type === 'exclusive') {
      query += query ? ' ' : '';
      query += 'filter:replies';
    }

    if (!formData.hasLinks.enabled) {
      query += query ? ' ' : '';
      query += '-filter:links';
    } else if (formData.hasLinks.type === 'exclusive') {
      query += query ? ' ' : '';
      query += 'filter:links';
    }

    // エンゲージメント
    if (formData.minLikes) {
      query += query ? ' ' : '';
      query += `min_faves:${formData.minLikes}`;
    }
    if (formData.minRetweets) {
      query += query ? ' ' : '';
      query += `min_retweets:${formData.minRetweets}`;
    }
    if (formData.minReplies) {
      query += query ? ' ' : '';
      query += `min_replies:${formData.minReplies}`;
    }

    // 日付
    if (formData.startYear && formData.startMonth && formData.startDay) {
      query += query ? ' ' : '';
      query += `since:${formData.startYear}-${formData.startMonth}-${formData.startDay}`;
    }
    if (formData.endYear && formData.endMonth && formData.endDay) {
      query += query ? ' ' : '';
      query += `until:${formData.endYear}-${formData.endMonth}-${formData.endDay}`;
    }

    // URLパラメータの作成
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('src', 'typed_query');

    return `https://x.com/search?${params.toString()}`;
  };

  const handleSearch = () => {
    const searchUrl = generateSearchUrl();
    // Xで検索ボタンクリック時のイベント送信
    sendGAEvent('click_x_search', {
      event_category: 'search',
      event_label: generatedCommand || 'empty_query'
    });
    window.open(searchUrl, '_blank');
  };

  const handleGenerateCommand = () => {
    generateSearchCommand();
    // 検索コマンド生成ボタンクリック時のイベント送信
    sendGAEvent('click_generate_command', {
      event_category: 'search',
      event_label: 'generate_command'
    });
  };

  return (
    <div className="container mx-auto p-4 max-w-lg pb-24">
      <div className="flex items-center justify-between mb-4 pb-4">
        <h1 className="text-xl font-semibold flex items-center">
          <FaSquareXTwitter className="inline-block mr-1" />
          高度な検索もどき
        </h1>
        <a
          href="https://hoshuto-app.vercel.app"
          onClick={() => sendGAEvent('click_hoshuto_app', {
            event_category: 'outbound',
            event_label: 'hoshuto_app'
          })}
          className="text-sm px-4 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-500 transition-colors"
        >
          <span className="text-red-500 mr-2">
            ●
          </span>
          保守党アプリ
        </a>
      </div>

      <div className="space-y-6">
        {/* キーワード */}
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">キーワード</h2>
          
          <div>
            <input
              type="text"
              id="allKeywords"
              name="allKeywords"
              value={formData.allKeywords}
              onChange={handleInputChange}
              className="w-full px-3 py-4 border rounded-sm"
              placeholder="次のキーワードをすべて含む"
            />
            <p className="text-xs text-gray-500 mt-1 ml-2">例: what's happening · 「what's」と「happening」の両方を含む
            </p>
          </div>

          <div>
            <input
              type="text"
              id="exactPhrase"
              name="exactPhrase"
              value={formData.exactPhrase}
              onChange={handleInputChange}
              className="w-full px-3 py-4 border rounded-sm"
              placeholder="次のキーワード全体を含む"
            />
            <p className="text-xs text-gray-500 mt-1 ml-2">例: happy hour・happy hourというキーワード全体を含む</p>
          </div>

          <div>
            <input
              type="text"
              id="anyKeywords"
              name="anyKeywords"
              value={formData.anyKeywords}
              onChange={handleInputChange}
              className="w-full px-3 py-4 border rounded-sm"
                placeholder="次のキーワードのいずれかを含む"
              />
              <p className="text-xs text-gray-500 mt-1 ml-2">例: cats dogs・catsとdogsのどちらか（または両方）を含む</p>
          </div>

          <div>
            <input
              type="text"
              id="excludeKeywords"
              name="excludeKeywords"
              value={formData.excludeKeywords}
              onChange={handleInputChange}
              className="w-full px-3 py-4 border rounded-sm"
                placeholder="次のキーワードを含まない"
              />
              <p className="text-xs text-gray-500 mt-1 ml-2">例: cats dogs・catsとdogsを含まない</p>
          </div>

          <div>
            <input
              type="text"
              id="hashtags"
              name="hashtags"
              value={formData.hashtags}
              onChange={handleInputChange}
              className="w-full px-3 py-4 border rounded-sm"
              placeholder="次のハッシュタグを含む"
            />
            <p className="text-xs text-gray-500 mt-1 ml-2">例: #ThrowbackThursday・ハッシュタグ #ThrowbackThursday を含む</p>
          </div>
        </div>

        {/* アカウント */}
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">アカウント</h2>
          
          <div>
            <input
              type="text"
              id="fromAccount"
              name="fromAccount"
              value={formData.fromAccount}
              onChange={handleInputChange}
              className="w-full px-3 py-4 border rounded-sm"
              placeholder="次のアカウントから送信"
            />
            <p className="text-xs text-gray-500 mt-1 ml-2">例: @X・@Xが送信</p>
          </div>

          <div>
            <input
              type="text"
              id="toAccount"
              name="toAccount"
              value={formData.toAccount}
              onChange={handleInputChange}
              className="w-full px-3 py-4 border rounded-sm"
              placeholder="次のアカウント宛て"
            />
            <p className="text-xs text-gray-500 mt-1 ml-2">例: @X・@Xへの返信として送信</p>
          </div>

          <div>
            <input
              type="text"
              id="mentionAccount"
              name="mentionAccount"
              value={formData.mentionAccount}
              onChange={handleInputChange}
              className="w-full px-3 py-4 border rounded-sm"
                placeholder="次のアカウントへの@ツイート"
              />
              <p className="text-xs text-gray-500 mt-1 ml-2">例: @SFBART @Caltrain・@SFBARTまたは@Caltrainへのツイート</p>
          </div>
        </div>

        {/* フィルター */}
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">フィルター</h2>
          
          {/* 返信 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">返信</span>
              <button
                type="button"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  hasReplies: { ...prev.hasReplies, enabled: !prev.hasReplies.enabled }
                }))}
                className={`${
                  formData.hasReplies.enabled ? 'bg-blue-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
              >
                <span
                  className={`${
                    formData.hasReplies.enabled ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </button>
            </div>
            
            {formData.hasReplies.enabled && (
              <div className="space-y-2 ml-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="repliesInclude"
                    name="repliesType"
                    checked={formData.hasReplies.type === 'include'}
                    onChange={() => setFormData(prev => ({
                      ...prev,
                      hasReplies: { ...prev.hasReplies, type: 'include' }
                    }))}
                    className="form-radio"
                  />
                  <label htmlFor="repliesInclude" className="text-sm cursor-pointer">返信と元のポストを含める</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="repliesExclusive"
                    name="repliesType"
                    checked={formData.hasReplies.type === 'exclusive'}
                    onChange={() => setFormData(prev => ({
                      ...prev,
                      hasReplies: { ...prev.hasReplies, type: 'exclusive' }
                    }))}
                    className="form-radio"
                  />
                  <label htmlFor="repliesExclusive" className="text-sm cursor-pointer">返信のみ表示</label>
                </div>
              </div>
            )}
          </div>

          {/* リンク */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">リンク</span>
              <button
                type="button"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  hasLinks: { ...prev.hasLinks, enabled: !prev.hasLinks.enabled }
                }))}
                className={`${
                  formData.hasLinks.enabled ? 'bg-blue-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
              >
                <span
                  className={`${
                    formData.hasLinks.enabled ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </button>
            </div>
            
            {formData.hasLinks.enabled && (
              <div className="space-y-2 ml-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="linksInclude"
                    name="linksType"
                    checked={formData.hasLinks.type === 'include'}
                    onChange={() => setFormData(prev => ({
                      ...prev,
                      hasLinks: { ...prev.hasLinks, type: 'include' }
                    }))}
                    className="form-radio"
                  />
                  <label htmlFor="linksInclude" className="text-sm cursor-pointer">リンクを含むポストを含める</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="linksExclusive"
                    name="linksType"
                    checked={formData.hasLinks.type === 'exclusive'}
                    onChange={() => setFormData(prev => ({
                      ...prev,
                      hasLinks: { ...prev.hasLinks, type: 'exclusive' }
                    }))}
                    className="form-radio"
                  />
                  <label htmlFor="linksExclusive" className="text-sm cursor-pointer">リンクを含むポストのみ表示</label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* エンゲージメント */}
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">エンゲージメント</h2>
          
          <div>
            <input
              type="number"
              id="minReplies"
              name="minReplies"
              value={formData.minReplies}
              onChange={handleInputChange}
              className="w-full px-3 py-4 border rounded-sm"
              placeholder="返信の最小件数"
            />
            <p className="text-xs text-gray-500 mt-1 ml-2">例: 280・返信が280件以上のポスト</p>
          </div>

          <div>
            <input
              type="number"
              id="minLikes"
              name="minLikes"
              value={formData.minLikes}
              onChange={handleInputChange}
              className="w-full px-3 py-4 border rounded-sm"
                placeholder="いいねの最小件数"
              />
              <p className="text-xs text-gray-500 mt-1 ml-2">例: 280・いいねが280件以上のポスト</p>
          </div>

          <div>
            <input
              type="number"
              id="minRetweets"
              name="minRetweets"
              value={formData.minRetweets}
              onChange={handleInputChange}
              className="w-full px-3 py-4 border rounded-sm"
                placeholder="リポストの最小件数"
              />
              <p className="text-xs text-gray-500 mt-1 ml-2">例: 280・リポストが280件以上のポスト</p>
          </div>
        </div>

        {/* 日付 */}
        <div className="space-y-4 pb-20">
          <h2 className="font-semibold text-lg">日付</h2>
          
          <div>
            <label className="block text-sm text-gray-600 mb-2">次の日付以降</label>
            <div className="grid grid-cols-3 gap-2">
              <select
                name="startYear"
                value={formData.startYear}
                onChange={handleInputChange}
                className="px-3 py-4 border rounded-sm"
              >
                <option value="">年</option>
                {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <select
                name="startMonth"
                value={formData.startMonth}
                onChange={handleInputChange}
                className="px-3 py-4 border rounded-sm"
              >
                <option value="">月</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <option key={month} value={month.toString().padStart(2, '0')}>{month}</option>
                ))}
              </select>
              <select
                name="startDay"
                value={formData.startDay}
                onChange={handleInputChange}
                className="px-3 py-4 border rounded-sm"
              >
                <option value="">日</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <option key={day} value={day.toString().padStart(2, '0')}>{day}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">次の日付以前</label>
            <div className="grid grid-cols-3 gap-2">
              <select
                name="endYear"
                value={formData.endYear}
                onChange={handleInputChange}
                className="px-3 py-4 border rounded-sm"
              >
                <option value="">年</option>
                {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <select
                name="endMonth"
                value={formData.endMonth}
                onChange={handleInputChange}
                className="px-3 py-4 border rounded-sm"
              >
                <option value="">月</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <option key={month} value={month.toString().padStart(2, '0')}>{month}</option>
                ))}
              </select>
              <select
                name="endDay"
                value={formData.endDay}
                onChange={handleInputChange}
                className="px-3 py-4 border rounded-sm"
              >
                <option value="">日</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <option key={day} value={day.toString().padStart(2, '0')}>{day}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* コマンド表示 */}
      {generatedCommand && (
        <div className="fixed bottom-[72px] left-0 right-0 bg-gray-100 border-t">
          <div className="container mx-auto max-w-lg p-4">
            <div className="flex justify-between items-center">
              <pre className="text-sm break-all whitespace-pre-wrap">{generatedCommand}</pre>
              <button
                onClick={copyToClipboard}
                className="flex items-center space-x-1 px-3 py-1 text-sm border rounded-sm hover:bg-gray-200 transition-colors ml-2 shrink-0"
              >
                <FaCopy />
                <span>コピー</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 固定フッター */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="container mx-auto max-w-lg">
          <div className="flex space-x-4">
            <button
              onClick={handleGenerateCommand}
              className="flex-1 bg-emerald-500 text-white py-3 px-4 rounded-md hover:bg-emerald-600 transition-colors"
            >
              検索コマンドを生成
            </button>
            <button
              onClick={handleSearch}
              className="flex-1 bg-gray-800 text-white py-3 px-4 rounded-md hover:bg-gray-600 transition-colors"
            >
              Xで検索
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
