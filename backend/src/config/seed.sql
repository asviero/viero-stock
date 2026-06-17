BEGIN TRANSACTION;

-- COMBOS --
INSERT INTO products (name, category, subcategory, price) VALUES

-- Vodka
('Absolut', 'Combos', 'Vodka', 399.00),
('Smirnoff', 'Combos', 'Vodka', 299.00),
-- Whisky
('Black Label', 'Combos', 'Whisky', 509.00),
('Chivas', 'Combos', 'Whisky', 509.00),
('Jack Daniel''s', 'Combos', 'Whisky', 439.00),
('Red Label', 'Combos', 'Whisky', 399.00),
-- Gin
('Beefeater', 'Combos', 'Gin', 389.00),
('Seagram''s', 'Combos', 'Gin', 349.00),
-- Vodka Premium
('Absolut Elyx', 'Combos', 'Vodka Premium', 509.00),
('Belvedere', 'Combos', 'Vodka Premium', 549.00),
('Grey Goose', 'Combos', 'Vodka Premium', 499.00),
('Grey Goose (1,5L)', 'Combos', 'Vodka Premium', 1390.00),
-- Fernet
('Fernet', 'Combos', 'Fernet', 399.00),
---------------------------------------------------------

-- GARRAFAS --
-- Gin
('Ballena', 'Garrafas', 'Gin', 419.00),
-- Whisky
('Black Label', 'Garrafas', 'Whisky', 419.00),
('Chivas', 'Garrafas', 'Whisky', 419.00),
('Jack Daniel''s', 'Garrafas', 'Whisky', 369.00),
('Macallan 12 Anos', 'Garrafas', 'Whisky', 2000.00),
('Royal Salute', 'Garrafas', 'Whisky', 1900.00),
-- Licor
('Jagermeister', 'Garrafas', 'Licor', 379.00),
('Licor 43', 'Garrafas', 'Licor', 419.00),
-- Tequila
('Tequila José Cuervo', 'Garrafas', 'Tequila', 369.00),
---------------------------------------------------------

-- ESPUMANTES
('Chandon', 'Espumantes', NULL, 249.00),
('Chandon (1,5L)', 'Espumantes', NULL, 449.00),
('Salton', 'Espumantes', NULL, 339.00),
('Combo Salton', 'Espumantes', NULL, 119.00),
-- CHAMPAGNE
('Veuve Clicquot', 'Champagne', NULL, 790.00),
-- DRINKS
('Aperol Spritz', 'Drinks', NULL, 32.00),
('Blue Moon', 'Drinks', NULL, 28.00),
('Caipirinha de Limão', 'Drinks', NULL, 25.00),
('Fernet com Coca', 'Drinks', NULL, 29.00),
('Gin Tônica', 'Drinks', NULL, 30.00),
('Melancita', 'Drinks', NULL, 32.00),
('Skol Beats', 'Drinks', NULL, 18.00),
('Summer Beach', 'Drinks', NULL, 27.00),
('Tropical Gin', 'Drinks', NULL, 34.00),

-- DOSES --
-- Vodka
('Absolut', 'Doses', 'Vodka', 19.00),
('Smirnoff', 'Doses', 'Vodka', 15.00),

-- Gin
('Ballena', 'Doses', 'Gin', 30.00),
('Beefeater', 'Doses', 'Gin', 22.00),
('Seagram''s', 'Doses', 'Gin', 17.00),

-- Whisky
('Jack Daniel''s', 'Doses', 'Whisky', 25.00),
('Red Label', 'Doses', 'Whisky', 23.00),

-- Licor
('Jagermeister', 'Doses', 'Licor', 25.00),
('Licor 43', 'Doses', 'Licor', 32.00),

-- Tequila
('Tequila José Cuervo', 'Doses', 'Tequila', 24.00),

-- CERVEJAS
('Corona', 'Cervejas', NULL, 19.00),
('Heineken', 'Cervejas', NULL, 18.00),
('Heineken 0,0%', 'Cervejas', NULL, 18.00),
('Sol', 'Cervejas', NULL, 16.00),
('Stella Artois', 'Cervejas', NULL, 18.00),

-- SOFTS
('Água', 'Softs', NULL, 7.00),
('Red Bull', 'Softs', NULL, 22.00),
('Refrigerante', 'Softs', NULL, 9.00),
('Schweppes Citrus', 'Softs', NULL, 15.00),
('Suco de Laranja', 'Softs', NULL, 22.00),
('Tônica', 'Softs', NULL, 15.00),

-- OUTROS
('Boné', 'Outros', NULL, 39.00),
('Bucket', 'Outros', NULL, 59.00),
('Canga', 'Outros', NULL, 39.00),
('Chaveiro', 'Outros', NULL, 19.00),
('Chinelo', 'Outros', NULL, 49.00),
('Halls', 'Outros', NULL, 8.00);

COMMIT;