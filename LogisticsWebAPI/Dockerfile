# Используем официальный образ .NET SDK для сборки
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Копируем файл проекта и восстанавливаем зависимости
COPY ["LogisticsWebAPI/LogisticsWebAPI.csproj", "LogisticsWebAPI/"]
RUN dotnet restore "LogisticsWebAPI/LogisticsWebAPI.csproj"

# Копируем весь исходный код и собираем приложение
COPY ["LogisticsWebAPI/", "LogisticsWebAPI/"]
COPY ["Frontend/", "Frontend/"]

WORKDIR "/src/LogisticsWebAPI"
RUN dotnet publish "LogisticsWebAPI.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Финальный образ для запуска
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

RUN apt-get update && apt-get install -y curl \
  && curl -sSL https://dot.net/v1/dotnet-install.sh  | bash /dev/stdin --channel 8.0 \
  && rm -rf /var/lib/apt/lists/*

ENV DOTNET_ROOT=/root/.dotnet
ENV PATH=$PATH:/root/.dotnet:/root/.dotnet/tools

RUN dotnet tool install --global dotnet-ef --version 8.0.0

# Копируем собранное приложение из этапа сборки
COPY --from=build /app/publish .

COPY --from=build /src/Frontend/pages ./wwwroot
COPY --from=build /src/Frontend/css ./wwwroot/css
COPY --from=build /src/Frontend/js ./wwwroot/js
COPY --from=build /src/Frontend/fonts ./wwwroot/fonts

# Точка входа приложения
EXPOSE 8080
ENTRYPOINT ["dotnet", "LogisticsWebAPI.dll"]
