'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { calculateBMR, calculateTDEE, ACTIVITY_MULTIPLIERS } from './utils/calculations'
import { MoonIcon, SunIcon, TrendingDown, TrendingUp } from 'lucide-react'

type Food = {
  Alimento: string;
  Unidade: string;
  Peso: string;
  Calorias: string;
};

type CustomMeal = {
  name: string;
  foods: { food: Food; quantity: number }[];
};

export default function CalorieTracker() {
  const [weight, setWeight] = useState<number>(0)
  const [height, setHeight] = useState<number>(0)
  const [age, setAge] = useState<number>(0)
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [activityLevel, setActivityLevel] = useState<keyof typeof ACTIVITY_MULTIPLIERS>('sedentario')
  const [bmr, setBMR] = useState<number>(0)
  const [tdee, setTDEE] = useState<number>(0)
  const [foods, setFoods] = useState<Food[]>([])
  const [selectedFood, setSelectedFood] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(1)
  const [consumedCalories, setConsumedCalories] = useState<number>(0)
  const [consumedFoods, setConsumedFoods] = useState<{ name: string, calories: number }[]>([])
  const [customMeals, setCustomMeals] = useState<CustomMeal[]>([])
  const [newMealName, setNewMealName] = useState<string>('')
  const [newMealFoods, setNewMealFoods] = useState<{ food: Food; quantity: number }[]>([])
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false)

  useEffect(() => {
    fetch('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/calorias-QSxrClBsW93GhpQ8AyHQlIGxe5ioWA.json')
      .then(response => response.json())
      .then(data => setFoods(data))
  }, [])

  useEffect(() => {
    const calculatedBMR = calculateBMR(weight, height, age, gender)
    setBMR(calculatedBMR)
    setTDEE(calculateTDEE(calculatedBMR, activityLevel))
  }, [weight, height, age, gender, activityLevel])

  const handleAddFood = () => {
    const food = foods.find(f => f.Alimento === selectedFood)
    if (food) {
      const calories = parseInt(food.Calorias) * quantity
      setConsumedCalories(prev => prev + calories)
      setConsumedFoods(prev => [...prev, { name: food.Alimento, calories }])
    }
  }

  const handleAddFoodToMeal = () => {
    const food = foods.find(f => f.Alimento === selectedFood)
    if (food) {
      setNewMealFoods(prev => [...prev, { food, quantity }])
    }
  }

  const handleCreateCustomMeal = () => {
    if (newMealName && newMealFoods.length > 0) {
      setCustomMeals(prev => [...prev, { name: newMealName, foods: newMealFoods }])
      setNewMealName('')
      setNewMealFoods([])
    }
  }

  const handleAddCustomMeal = (meal: CustomMeal) => {
    const totalCalories = meal.foods.reduce((sum, { food, quantity }) => {
      return sum + parseInt(food.Calorias) * quantity
    }, 0)
    setConsumedCalories(prev => prev + totalCalories)
    setConsumedFoods(prev => [...prev, { name: meal.name, calories: totalCalories }])
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div className={`min-h-screen p-4 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Rastreador de Calorias</h1>
          <Button onClick={toggleDarkMode} variant="outline" size="icon" className="bg-white dark:bg-gray-800">
            {isDarkMode ? <SunIcon className="h-[1.2rem] w-[1.2rem] text-yellow-500" /> : <MoonIcon className="h-[1.2rem] w-[1.2rem] text-gray-700" />}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800 dark:text-gray-200">Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <Input id="weight" type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} />
                </div>
                
                <div>
                  <Label htmlFor="height">Altura (cm)</Label>
                  <Input id="height" type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} />
                </div>
                
                <div>
                  <Label htmlFor="age">Idade</Label>
                  <Input id="age" type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} />
                </div>
                
                <div>
                  <Label>Gênero</Label>
                  <RadioGroup value={gender} onValueChange={(value: 'male' | 'female') => setGender(value)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male">Masculino</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female">Feminino</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div>
                  <Label htmlFor="activity">Nível de Atividade</Label>
                  <Select value={activityLevel} onValueChange={(value: keyof typeof ACTIVITY_MULTIPLIERS) => setActivityLevel(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o nível de atividade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentario">Sedentário</SelectItem>
                      <SelectItem value="leve">Leve</SelectItem>
                      <SelectItem value="moderado">Moderado</SelectItem>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="muitoAtivo">Muito Ativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800 dark:text-gray-200">Informações Calóricas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Posso consumir:</span>
                  <span className="font-semibold">{tdee.toFixed(2)} calorias</span>
                </div>
                <div className="flex justify-between">
                  <span>Consumidas:</span>
                  <span className="font-semibold">{consumedCalories} calorias</span>
                </div>
                <div className="flex justify-between">
                  <span>Calorias Restantes:</span>
                  <span className="font-semibold text-lg text-green-600 dark:text-green-400">
                    {(tdee - consumedCalories).toFixed(2)} calorias
                  </span>
                </div>
                <div className="mt-4 text-center font-medium">
                  {consumedCalories > tdee ? (
                    <p className="text-red-600 dark:text-red-400 flex items-center justify-center">
                      <TrendingUp className="mr-2" />
                      Neste ritmo, você poderá ganhar peso hoje.
                    </p>
                  ) : (
                    <p className="text-green-600 dark:text-green-400 flex items-center justify-center">
                      <TrendingDown className="mr-2" />
                      Neste ritmo, você poderá perder peso hoje.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-8 bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800 dark:text-gray-200">Adicionar Alimento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
              <Select value={selectedFood} onValueChange={setSelectedFood}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um alimento" />
                </SelectTrigger>
                <SelectContent>
                  {foods.map((food, index) => (
                    <SelectItem key={`${food.Alimento}-${index}`} value={food.Alimento}>
                      {food.Alimento}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input 
                type="number" 
                value={quantity} 
                onChange={(e) => setQuantity(Number(e.target.value))} 
                placeholder="Quantidade"
                className="w-full md:w-24"
              />
              <Button onClick={handleAddFood} className="w-full md:w-auto">Adicionar</Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-8 bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800 dark:text-gray-200">Criar Refeição Personalizada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input 
                type="text" 
                value={newMealName} 
                onChange={(e) => setNewMealName(e.target.value)} 
                placeholder="Nome da Refeição"
              />
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                <Select value={selectedFood} onValueChange={setSelectedFood}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um alimento" />
                  </SelectTrigger>
                  <SelectContent>
                    {foods.map((food, index) => (
                      <SelectItem key={`${food.Alimento}-${index}`} value={food.Alimento}>
                        {food.Alimento}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input 
                  type="number" 
                  value={quantity} 
                  onChange={(e) => setQuantity(Number(e.target.value))} 
                  placeholder="Quantidade"
                  className="w-full md:w-24"
                />
                <Button onClick={handleAddFoodToMeal} className="w-full md:w-auto">Adicionar à Refeição</Button>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Alimentos na Refeição:</h3>
                <ul className="list-disc pl-5">
                  {newMealFoods.map((item, index) => (
                    <li key={index}>{item.food.Alimento} - Quantidade: {item.quantity}</li>
                  ))}
                </ul>
              </div>
              <Button onClick={handleCreateCustomMeal} className="w-full">Criar Refeição Personalizada</Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-8 bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800 dark:text-gray-200">Refeições Personalizadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {customMeals.map((meal, index) => (
                <Button key={index} onClick={() => handleAddCustomMeal(meal)} variant="outline" className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600">
                  {meal.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800 dark:text-gray-200">Alimentos Consumidos</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {consumedFoods.map((food, index) => (
                <li key={index} className="flex justify-between">
                  <span>{food.name}</span>
                  <span>{food.calories} calorias</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

