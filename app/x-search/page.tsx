'use client';

import { useState, ChangeEvent } from 'react';
import { FaCalendar, FaCopy } from 'react-icons/fa';

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
  language: string;
  hasReplies: {
    include: boolean;
    exclusive: boolean;
  };
  hasLinks: {
    include: boolean;
    exclusive: boolean;
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
    language: '',
    hasReplies: {
      include: false,
      exclusive: false
    },
    hasLinks: {
      include: false,
      exclusive: false
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

    if (formData.fromAccount) {
      command += `from:${formData.fromAccount.replace('@', '')} `;
    }

    if (formData.toAccount) {
      command += `to:${formData.toAccount.replace('@', '')} `;
    }

    if (formData.mentionAccount) {
      command += `to:${formData.mentionAccount.replace('@', '')} `;
    }

    if (formData.hashtags) {
      const tags = formData.hashtags.split(' ');
      command += tags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ') + ' ';
    }

    if (formData.hasReplies.include) {
      command += 'filter:replies ';
    }
    if (formData.hasReplies.exclusive) {
      command += '-filter:replies ';
    }

    if (formData.hasLinks.include) {
      command += 'filter:links ';
    }
    if (formData.hasLinks.exclusive) {
      command += '-filter:links ';
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

    if (formData.language) {
      command += `lang:${formData.language} `;
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
      query += `from:${formData.fromAccount.replace('@', '')}`;
    }

    if (formData.toAccount) {
      query += query ? ' ' : '';
      query += `to:${formData.toAccount.replace('@', '')}`;
    }

    if (formData.mentionAccount) {
      query += query ? ' ' : '';
      query += `@${formData.mentionAccount.replace('@', '')}`;
    }

    // フィルター
    if (formData.hasReplies.include) {
      query += query ? ' ' : '';
      query += 'filter:replies';
    }
    if (formData.hasReplies.exclusive) {
      query += query ? ' ' : '';
      query += '-filter:replies';
    }

    if (formData.hasLinks.include) {
      query += query ? ' ' : '';
      query += 'filter:links';
    }
    if (formData.hasLinks.exclusive) {
      query += query ? ' ' : '';
      query += '-filter:links';
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
    if (formData.language) {
      params.append('lang', formData.language);
    }
    params.append('src', 'typed_query');

    return `https://x.com/search?${params.toString()}`;
  };

  const handleSearch = () => {
    const searchUrl = generateSearchUrl();
    window.open(searchUrl, '_blank');
  };

  return (
    <div className="container mx-auto p-4 max-w-lg pb-24">
      <h1 className="text-xl font-bold mb-4 pb-4 border-b">高度な検索</h1>

      <div className="space-y-6">
        {/* キーワード */}
        <div className="space-y-4">
          <h2 className="font-semibold">キーワード</h2>
          
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

        {/* 言語 */}
        <div>
          <h2 className="font-semibold mb-2">言語</h2>
          <select
            id="language"
            name="language"
            value={formData.language}
            onChange={handleInputChange}
            className="w-full px-3 py-4 border rounded-sm"
          >
            <option value="">すべての言語</option>
            <option value="ja">日本語</option>
            <option value="en">英語</option>
            <option value="ko">韓国語</option>
            <option value="zh">中国語</option>
          </select>
        </div>

        {/* アカウント */}
        <div className="space-y-4">
          <h2 className="font-semibold">アカウント</h2>
          
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
          <h2 className="font-semibold">フィルター</h2>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">返信</span>
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="hasReplies"
                    checked={!formData.hasReplies.include && !formData.hasReplies.exclusive}
                    onChange={() => setFormData(prev => ({
                      ...prev,
                      hasReplies: { include: false, exclusive: false }
                    }))}
                    className="form-radio"
                  />
                  <span className="ml-2 text-sm">すべて</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="hasReplies"
                    checked={formData.hasReplies.include}
                    onChange={() => setFormData(prev => ({
                      ...prev,
                      hasReplies: { include: true, exclusive: false }
                    }))}
                    className="form-radio"
                  />
                  <span className="ml-2 text-sm">返信と元のポストを含める</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="hasReplies"
                    checked={formData.hasReplies.exclusive}
                    onChange={() => setFormData(prev => ({
                      ...prev,
                      hasReplies: { include: false, exclusive: true }
                    }))}
                    className="form-radio"
                  />
                  <span className="ml-2 text-sm">返信のみ表示</span>
                </label>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">リンク</span>
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="hasLinks"
                    checked={!formData.hasLinks.include && !formData.hasLinks.exclusive}
                    onChange={() => setFormData(prev => ({
                      ...prev,
                      hasLinks: { include: false, exclusive: false }
                    }))}
                    className="form-radio"
                  />
                  <span className="ml-2 text-sm">すべて</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="hasLinks"
                    checked={formData.hasLinks.include}
                    onChange={() => setFormData(prev => ({
                      ...prev,
                      hasLinks: { include: true, exclusive: false }
                    }))}
                    className="form-radio"
                  />
                  <span className="ml-2 text-sm">リンクを含むポストを含める</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="hasLinks"
                    checked={formData.hasLinks.exclusive}
                    onChange={() => setFormData(prev => ({
                      ...prev,
                      hasLinks: { include: false, exclusive: true }
                    }))}
                    className="form-radio"
                  />
                  <span className="ml-2 text-sm">リンクを含むポストのみ表示</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* エンゲージメント */}
        <div className="space-y-4">
          <h2 className="font-semibold">エンゲージメント</h2>
          
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
          <h2 className="font-semibold">日付</h2>
          
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
              onClick={generateSearchCommand}
              className="flex-1 bg-emerald-500 text-white py-2 px-4 rounded-sm hover:bg-emerald-600 transition-colors"
            >
              検索コマンドを生成
            </button>
            <button
              onClick={handleSearch}
              className="flex-1 bg-gray-800 text-white py-2 px-4 rounded-sm hover:bg-gray-600 transition-colors"
            >
              Xで検索
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
