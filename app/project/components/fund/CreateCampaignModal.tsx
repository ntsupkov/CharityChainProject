'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { mockNFTTemplates, getNFTRarityColor } from '@/lib/mock-data';
import { Wand2, Loader2, CheckCircle } from 'lucide-react';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GeneratedNFT {
  id: string;
  name: string;
  description: string;
  image: string;
  rarity: string;
}

interface GenerationProgress {
  collectionId: string;
  status: 'pending' | 'generating' | 'completed' | 'error';
  nfts: GeneratedNFT[];
}

export default function CreateCampaignModal({ isOpen, onClose }: CreateCampaignModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [nftGenerating, setNftGenerating] = useState(false);
  const [showNFTPreview, setShowNFTPreview] = useState(false);
  const [generatedNFTs, setGeneratedNFTs] = useState<GeneratedNFT[]>([]);
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAmount: '',
    nftPrompt: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Симуляция создания кампании
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // В реальном приложении здесь был бы API-запрос
      console.log('Создаём кампанию:', formData);
      
      onClose();
      setFormData({ title: '', description: '', targetAmount: '', nftPrompt: '' });
      setShowNFTPreview(false);
      setGeneratedNFTs([]);
      setGenerationProgress([]);
    } catch (error) {
      console.error('Ошибка создания кампании:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNFTPreview = async () => {
    if (!formData.nftPrompt.trim()) {
      alert('Пожалуйста, введите промпт для NFT');
      return;
    }

    setNftGenerating(true);
    setShowNFTPreview(true);
    setGeneratedNFTs([]);
    setGenerationProgress([]);

    try {
      const collectionIds: string[] = [];
      const initialProgress: GenerationProgress[] = [];
      
      for (let i = 0; i < 3; i++) {
        const generateResponse = await fetch("https://api.chaingpt.org/nft/generate-nft-queue", {
          mMATICod: "POST",
          headers: {
            "Authorization": "Bearer 2819bbff-d326-449a-9030-6c9c9de97b76",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            walletAddress: "0xa42C59388804338661A71Ff30A4ec05C7f0fa199",
            prompt: formData.nftPrompt,
            model: "nebula_forge_xl",
            steps: 25,
            height: 1024,
            width: 1024,
            enhance: "2x",
            chainId: 56,
            amount: 1, 
            style: "cinematic",
            traits: [
              {
                trait_type: "Background",
                value: [
                  { value: "Heaven", ratio: 20 },
                  { value: "Hell", ratio: 60 },
                  { value: "garden", ratio: 20 }
                ]
              }
            ]
          })
        });

        const generateData = await generateResponse.json();
        console.log(`Инициализация генерации ${i + 1}/3:`, generateData);

        const collectionID = generateData.data?.collectionId;
        if (collectionID) {
          collectionIds.push(collectionID);
          initialProgress.push({
            collectionId: collectionID,
            status: 'generating',
            nfts: []
          });
        }
      }

      // Устанавливаем начальное состояние прогресса
      setGenerationProgress(initialProgress);
      console.log('Все запросы на генерацию отправлены:', collectionIds);

      // Теперь проверяем прогресс всех коллекций
      const checkAllProgress = async () => {
        let attempts = 0;
        const maxAttempts = 60;

        const checkProgress = async (): Promise<void> => {
          attempts++;
          
          if (attempts > maxAttempts) {
            console.error('Превышено максимальное количество попыток');
            setNftGenerating(false);
            alert('Генерация NFT заняла слишком много времени. Попробуйте позже.');
            return;
          }

          const myHeaders = new Headers();
          myHeaders.append("Authorization", "Bearer 2819bbff-d326-449a-9030-6c9c9de97b76");
          
          const requestOptions = {
            mMATICod: "GET",
            headers: myHeaders,
            redirect: "follow" as RequestRedirect
          };

          try {
            const progressPromises = collectionIds.map(id => 
              fetch(`https://api.chaingpt.org/nft/progress/${id}`, requestOptions)
                .then(response => response.json())
            );

            const progressResults = await Promise.all(progressPromises);
            console.log("Подробные данные по каждой коллекции:");
            progressResults.forEach((result, i) => {
              console.log(`Коллекция ${collectionIds[i]}:`);
              console.log("generated:", result.data?.generated);
              console.log("images:", result.data?.images);
            });
            
            console.log(`Прогресс всех коллекций (попытка ${attempts}/${maxAttempts}):`, progressResults);

            // Обновляем состояние прогресса и NFT в реальном времени
            const updatedProgress: GenerationProgress[] = [];
            const allNFTs: GeneratedNFT[] = [];
            let completedCount = 0;

            progressResults.forEach((progressData, index) => {
              const collectionId = collectionIds[index];
              
              if (progressData.data?.generated === true && progressData.data?.images?.length > 0) {
                completedCount++;
                
                // Создаем NFT из готовых изображений
                const collectionNFTs = (progressData.data.images ?? []).map((imageUrl: string, imageIndex: number) => {
                  const globalIndex = index; // индекс запроса
                  return {
                    id: `nft-${collectionId}-${imageIndex}`,
                    name: `NFT #${globalIndex * 1 + 1}`, // можно настроить отображение по порядку
                    description: `Сгенерированный NFT по промпту: "${formData.nftPrompt}"`,
                    image: imageUrl,
                    rarity:
                      globalIndex === 0 ? 'Rare' :
                      globalIndex === 1 ? 'Uncommon' :
                      'Common'
                  };
                });
                

                allNFTs.push(...collectionNFTs);
                
                updatedProgress.push({
                  collectionId,
                  status: 'completed',
                  nfts: collectionNFTs
                });
              } else {
                updatedProgress.push({
                  collectionId,
                  status: 'generating',
                  nfts: []
                });
              }
            });

            // Обновляем состояние в реальном времени
            setGenerationProgress(updatedProgress);
            setGeneratedNFTs(allNFTs);

            // Если все коллекции готовы
            if (completedCount === collectionIds.length) {
              setNftGenerating(false);
              console.log('Все NFT успешно сгенерированы:', allNFTs);
            } else {
              // Если не все готовы, повторяем через 3 секунды
              setTimeout(checkProgress, 3000);
            }
          } catch (error) {
            console.error('Ошибка при проверке прогресса:', error);
            
            // Если это не последняя попытка, повторяем через 3 секунды
            if (attempts < maxAttempts) {
              setTimeout(checkProgress, 3000);
            } else {
              setNftGenerating(false);
              alert('Ошибка при генерации NFT. Попробуйте позже.');
            }
          }
        };

        // Начинаем проверку прогресса
        checkProgress();
      };

      // Начинаем проверку всех коллекций
      checkAllProgress();

    } catch (error) {
      console.error('Ошибка генерации NFT:', error);
      setNftGenerating(false);
      alert('Ошибка при генерации NFT. Попробуйте снова.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-stone-800">Создать новый сбор</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Название сбора</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  className="mt-1"
                  placeholder="Например: Помощь бездомным животным"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                  className="mt-1 min-h-[100px]"
                  placeholder="Расскажите о вашей благотворительной инициативе..."
                />
              </div>
              
              <div>
                <Label htmlFor="targetAmount">Целевая сумма (MATIC)</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  step="0.01"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
                  required
                  className="mt-1"
                  placeholder="5.0"
                />
              </div>
              
              <div>
                <Label htmlFor="nftPrompt">Промпт для NFT коллекции</Label>
                <div className="mt-1 flex space-x-2">
                  <Input
                    id="nftPrompt"
                    value={formData.nftPrompt}
                    onChange={(e) => setFormData({...formData, nftPrompt: e.target.value})}
                    required
                    placeholder="пушистые коты, нарисованные в стиле импрессионизма"
                  />
                  <Button
                    type="button"
                    onClick={generateNFTPreview}
                    variant="outline"
                    className="border-amber-200 text-amber-700 hover:bg-amber-50"
                    disabled={nftGenerating}
                  >
                    {nftGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Wand2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-stone-800">Превью NFT коллекции</h3>
              {showNFTPreview ? (
                <div className="space-y-4">
                  <p className="text-sm text-stone-600">
                    Промпт: "{formData.nftPrompt}"
                  </p>
                  
                  {/* Показываем статус генерации */}
                  {generationProgress.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-stone-600">
                        <span>Прогресс генерации:</span>
                        <span className="font-medium">
                          {generationProgress.filter(p => p.status === 'completed').length} из {generationProgress.length}
                        </span>
                      </div>
                      
                      <div className="flex space-x-2">
                        {generationProgress.map((progress, index) => (
                          <div key={progress.collectionId} className="flex items-center space-x-1">
                            {progress.status === 'completed' ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                            )}
                            <span className="text-xs text-stone-500">NFT {index + 1}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {generatedNFTs.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                      {generatedNFTs.map((nft) => (
                        <Card key={nft.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="aspect-square bg-gray-100">
                            <img
                              src={nft.image}
                              alt={nft.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error('Ошибка загрузки изображения:', nft.image);
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-sm text-stone-800">{nft.name}</h4>
                              <Badge className={`text-xs ${getNFTRarityColor(nft.rarity)}`}>
                                {nft.rarity}
                              </Badge>
                            </div>
                            <p className="text-xs text-stone-500 leading-relaxed">
                              {nft.description}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : nftGenerating ? (
                    <div className="bg-stone-50 rounded-lg p-8 text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-amber-600" />
                      <p className="text-stone-500">
                        Генерируем NFT коллекцию...
                      </p>
                      <p className="text-sm text-stone-400 mt-2">
                        Это может занять 1-3 минуты
                      </p>
                    </div>
                  ) : (
                    <div className="bg-stone-50 rounded-lg p-8 text-center">
                      <p className="text-stone-500">
                        Нет сгенерированных NFT для отображения
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-stone-50 rounded-lg p-8 text-center">
                  <p className="text-stone-500">
                    Введите промпт и нажмите кнопку для генерации превью NFT коллекции
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-amber-500 to-stone-500 hover:from-amber-600 hover:to-stone-600"
            >
              {loading ? 'Создаём...' : 'Создать сбор'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}