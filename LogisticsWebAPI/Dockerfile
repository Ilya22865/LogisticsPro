# Используем официальный образ .NET SDK для сборки
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Копируем файл проекта и восстанавливаем зависимости
COPY ["LogisticsWebAPI/LogisticsWebAPI.csproj", "LogisticsWebAPI/"]
RUN dotnet restore "LogisticsWebAPI/LogisticsWebAPI.csproj"

# Копируем весь исходный код и собираем приложение
COPY ["LogisticsWebAPI/", "LogisticsWebAPI/"]
WORKDIR "/src/LogisticsWebAPI"
RUN dotnet publish "LogisticsWebAPI.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Финальный образ для запуска
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

# Копируем собранное приложение из этапа сборки
COPY --from=build /app/publish .

# Точка входа приложения
ENTRYPOINT ["dotnet", "LogisticsWebAPI.dll"]
