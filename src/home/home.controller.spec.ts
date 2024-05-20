import { Test, TestingModule } from '@nestjs/testing';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PropertyType } from '@prisma/client';
import { UnauthorizedException } from '@nestjs/common';

const mockUser = {
  id: 1,
  name: "muma",
  email: "muma@gmail.com",
  phone: "12345"
}

const mockHome = {
  id: 1,
  address: 'molyko',
  city: 'Buea',
  price: 10000000,
  number_of_bathrooms: 6,
  number_of_bedrooms: 9,
  land_size: 444,
  propertyType: PropertyType.RESIDENTIAL,
  image: 'img1'
};

describe('HomeController', () => {
  let controller: HomeController,
      homeService: HomeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ PrismaService,
        { 
          provide: HomeService,
          useValue: {
            getHomes: jest.fn().mockReturnValue([]),
            getRealtorByHomeId: jest.fn().mockReturnValue(mockUser),
            updateHomeById: jest.fn().mockReturnValue(mockHome)
          }

        }
      ],
      controllers: [HomeController],
    }).compile();

    controller = module.get<HomeController>(HomeController);
    homeService = module.get<HomeService>(HomeService);
  });

  describe('getHomes',() => {
    it('should construct filter object correctly',  async () => {
      const mockGetHomes = jest.fn().mockReturnValue([])
      jest
      .spyOn(homeService, 'getHomes')
      .mockImplementation(mockGetHomes)
      
      await controller.getHomes("Buea", "1500");

      expect(mockGetHomes).toBeCalledWith({
        city: "Buea",
        price: {
          gte: 1500
        }
      })
    })
  });

    describe('updateHome', () => {

      const mockUserInfo = {
        name: 'muma',
        id: 6,
        iat: 1,
        exp: 2
      }

      const mockCreateHomeParams = {
        address: 'molyko',
        numberOfBathrooms: 6,
        numberOfBedrooms: 9,
        city: 'Buea',
        landSize: 444,
        price: 10000000,
        propertyType: PropertyType.RESIDENTIAL
      };

      it("should throw an error if realtor didn't create home", async () => {
        
        await expect( controller.updateHome(5,mockCreateHomeParams, mockUserInfo)).rejects.toThrowError(UnauthorizedException)
      })

      it("should update home if realtor is is valid", async () => {
        const mockUpdateHome = jest.fn().mockReturnValue(mockHome)

        jest
        .spyOn(homeService,"updateHomeById")
        .mockImplementation(mockUpdateHome)

        await expect( controller.updateHome(5,
          mockCreateHomeParams, 
          {...mockUserInfo, id:1}
        ))

        expect(mockUpdateHome).toBeCalled()
      })
    })
});
